import OpenAI from 'openai';

function ensureMermaidPrefix(code, dir) {
  if (!code || !code.trim()) return `graph ${dir}\n  A[未从 PDF 提取到有效文本]\n`;
  if (!/^graph\s+(TB|LR|BT|RL)/i.test(code)) {
    return `graph ${dir}\n` + code.trim() + (code.endsWith('\n') ? '' : '\n');
  }
  return code;
}

// 根据图表类型生成多模态系统提示词
function getVisionSystemPrompt(chartType, dir, maxNodes) {
  switch (chartType) {
    case 'mindmap':
      return `你是将 PDF 内容（文本+页面截图）提炼为思维导图的专家。严格遵守：\n- 仅输出思维导图代码，不要解释、不要包裹代码块。\n- 使用 mindmap 语法开头。\n- 节点不超过 ${maxNodes} 个，优先核心主题与关键分支。\n- 中心主题用 root((主题)) 表示，分支用缩进表示层级。\n- 如无法读取有效信息，输出 mindmap\\n  root((未从 PDF 提取到有效文本))`;
    
    case 'timeline':
      return `你是将 PDF 内容（文本+页面截图）提炼为时间轴的专家。严格遵守：\n- 仅输出时间轴代码，不要解释、不要包裹代码块。\n- 使用 timeline 语法开头。\n- 事件不超过 ${maxNodes} 个，按时间顺序排列。\n- 格式：timeline\\n  title 标题\\n  事件1\\n  事件2\n- 如无法读取有效信息，输出 timeline\\n  title 未从 PDF 提取到有效文本`;
    
    case 'gantt':
      return `你是将 PDF 内容（文本+页面截图）提炼为甘特图的专家。严格遵守：\n- 仅输出甘特图代码，不要解释、不要包裹代码块。\n- 使用 gantt 语法开头。\n- 任务不超过 ${maxNodes} 个，包含时间信息。\n- 格式：gantt\\n  title 项目标题\\n  section 阶段\\n  任务名 :状态, 标识, 开始日期, 持续时间\n- 如无法读取有效信息，输出 gantt\\n  title 未从 PDF 提取到有效文本`;
    
    case 'orgchart':
      return `你是将 PDF 内容（文本+页面截图）提炼为组织架构图的专家。严格遵守：\n- 仅输出组织架构图代码，不要解释、不要包裹代码块。\n- 使用 graph TB 语法。\n- 节点不超过 ${maxNodes} 个，体现层级关系。\n- 用 --> 连接上下级关系。\n- 如无法读取有效信息，输出 graph TB\\n  A[未从 PDF 提取到有效文本]`;
    
    case 'network':
      return `你是将 PDF 内容（文本+页面截图）提炼为网络拓扑图的专家。严格遵守：\n- 仅输出网络图代码，不要解释、不要包裹代码块。\n- 使用 graph LR 语法。\n- 节点不超过 ${maxNodes} 个，体现网络连接关系。\n- 用 --- 连接网络节点。\n- 如无法读取有效信息，输出 graph LR\\n  A[未从 PDF 提取到有效文本]`;
    
    default:
      return `你是将 PDF 内容（文本+页面截图）提炼为 Mermaid flowchart 的专家。严格遵守：\n- 仅输出 Mermaid 代码，不要解释、不要包裹代码块。\n- 使用 graph ${dir} 开头。\n- 节点不超过 ${maxNodes} 个，优先标题与关键要点。\n- 标签简短（<= 60 字），移除冗余标点/括号。\n- 顺序/层级关系均用 --> 表达。\n- 如无法读取有效信息，输出 graph ${dir}\\n  A[未从 PDF 提取到有效文本]`;
  }
}

/**
 * Ask multimodal model to produce Mermaid from combined text + sampled page images
 */
export async function aiGenerateMermaidVision({ text, images = [], direction = 'TB', maxNodes = 60, chartType = 'mermaid' }) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) throw new Error('Missing ARK_API_KEY');

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  const dir = direction === 'LR' ? 'LR' : 'TB';
  const content = (text || '').slice(0, 20000);

  const systemPrompt = getVisionSystemPrompt(chartType, dir, maxNodes);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',
      content: [
        { type: 'text', text: `以下是 PDF 的文本内容（截断）：\n\n${content}\n\n并附带若干页面截图（用于表格/版式/图片理解）。请综合生成 Mermaid（graph ${dir} 开头）：` },
        ...images.map((dataUrl) => ({ type: 'image_url', image_url: { url: dataUrl } })),
      ]
    }
  ];

  const completion = await client.chat.completions.create({
    model: 'doubao-seed-1-6-thinking-250715',
    messages,
    temperature: 0.2,
  });

  const code = completion?.choices?.[0]?.message?.content || '';
  return ensureMermaidPrefix(code, dir);
}