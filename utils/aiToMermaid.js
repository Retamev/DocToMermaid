import OpenAI from 'openai';

function ensureMermaidPrefix(code, dir) {
  if (!code || !code.trim()) return `graph ${dir}\n  A[未从 PDF 提取到有效文本]\n`;
  if (!/^graph\s+(TB|LR|BT|RL)/i.test(code)) {
    return `graph ${dir}\n` + code.trim() + (code.endsWith('\n') ? '' : '\n');
  }
  return code;
}

// 根据图表类型生成系统提示词
function getSystemPrompt(chartType, dir, maxNodes) {
  switch (chartType) {
    case 'mindmap':
      return `你是将文档内容提炼为思维导图的专家。严格遵守以下规则：\n- 只输出思维导图代码，不要解释、不要包裹代码块。\n- 使用 mindmap 语法开头。\n- 节点不超过 ${maxNodes} 个，优先保留核心主题与关键分支。\n- 中心主题用 root((主题)) 表示，分支用缩进表示层级。\n- 内容为空时输出：mindmap\\n  root((未从 PDF 提取到有效文本))`;
    
    case 'timeline':
      return `你是将文档内容提炼为时间轴的专家。严格遵守以下规则：\n- 只输出时间轴代码，不要解释、不要包裹代码块。\n- 使用 timeline 语法开头。\n- 事件不超过 ${maxNodes} 个，按时间顺序排列。\n- 格式：timeline\\n  title 标题\\n  事件1\\n  事件2\n- 内容为空时输出：timeline\\n  title 未从 PDF 提取到有效文本`;
    
    case 'gantt':
      return `你是将文档内容提炼为甘特图的专家。严格遵守以下规则：\n- 只输出甘特图代码，不要解释、不要包裹代码块。\n- 使用 gantt 语法开头。\n- 任务不超过 ${maxNodes} 个，包含时间信息。\n- 格式：gantt\\n  title 项目标题\\n  section 阶段\\n  任务名 :状态, 标识, 开始日期, 持续时间\n- 内容为空时输出：gantt\\n  title 未从 PDF 提取到有效文本`;
    
    case 'orgchart':
      return `你是将文档内容提炼为组织架构图的专家。严格遵守以下规则：\n- 只输出组织架构图代码，不要解释、不要包裹代码块。\n- 使用 graph TB 语法。\n- 节点不超过 ${maxNodes} 个，体现层级关系。\n- 用 --> 连接上下级关系。\n- 内容为空时输出：graph TB\\n  A[未从 PDF 提取到有效文本]`;
    
    case 'network':
      return `你是将文档内容提炼为网络拓扑图的专家。严格遵守以下规则：\n- 只输出网络图代码，不要解释、不要包裹代码块。\n- 使用 graph LR 语法。\n- 节点不超过 ${maxNodes} 个，体现网络连接关系。\n- 用 --- 连接网络节点。\n- 内容为空时输出：graph LR\\n  A[未从 PDF 提取到有效文本]`;
    
    default:
      return `你是将文档内容提炼为 Mermaid flowchart 的专家。严格遵守以下规则：\n- 只输出 Mermaid 代码，不要解释、不要包裹代码块。\n- 方向使用 graph ${dir}。\n- 节点不超过 ${maxNodes} 个，优先保留标题与关键要点。\n- 节点标签尽量简短（<= 60 字），移除括号与多余标点。\n- 用 --> 连接顺序关系；有层级时父子用 --> 表达，兄弟按顺序并列。\n- 内容为空时输出：graph ${dir}\\n  A[未从 PDF 提取到有效文本]`;
  }
}

// 根据图表类型生成用户提示词
function getUserPrompt(chartType, dir, content) {
  const chartTypeNames = {
    'mindmap': '思维导图',
    'timeline': '时间轴图',
    'gantt': '甘特图',
    'orgchart': '组织架构图',
    'network': '网络拓扑图',
    'mermaid': 'Mermaid flowchart',
    'flowchart': '流程图'
  };
  
  const chartName = chartTypeNames[chartType] || '图表';
  const syntaxHint = chartType === 'mermaid' || chartType === 'flowchart' ? 
    `（graph ${dir} 开头）` : '';
  
  return `文档内容如下，请基于内容生成${chartName}代码${syntaxHint}，遵守以上规则：\n\n${content}`;
}

export async function aiGenerateMermaid(text, direction = 'TB', maxNodes = 60, options = {}) {
  const chartType = options.chartType || 'mermaid';
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) throw new Error('Missing ARK_API_KEY');

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  const dir = direction === 'LR' ? 'LR' : 'TB';
  const content = (text || '').slice(0, 20000); // 保护性截断，避免上下文过长

  const systemPrompt = getSystemPrompt(chartType, dir, maxNodes);

  const userPrompt = getUserPrompt(chartType, dir, content);

  const completion = await client.chat.completions.create({
    model: 'doubao-seed-1-6-thinking-250715',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });

  const code = completion?.choices?.[0]?.message?.content || '';
  return ensureMermaidPrefix(code, dir);
}