import OpenAI from 'openai';

function ensureMermaidPrefix(code, dir) {
  if (!code || !code.trim()) return `graph ${dir}\n  A[未从 PDF 提取到有效文本]\n`;
  if (!/^graph\s+(TB|LR|BT|RL)/i.test(code)) {
    return `graph ${dir}\n` + code.trim() + (code.endsWith('\n') ? '' : '\n');
  }
  return code;
}

export async function aiGenerateMermaid(text, direction = 'TB', maxNodes = 60) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) throw new Error('Missing ARK_API_KEY');

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  const dir = direction === 'LR' ? 'LR' : 'TB';
  const content = (text || '').slice(0, 20000); // 保护性截断，避免上下文过长

  const systemPrompt = `你是将文档内容提炼为 Mermaid flowchart 的专家。严格遵守以下规则：\n- 只输出 Mermaid 代码，不要解释、不要包裹代码块。\n- 方向使用 graph ${dir}。\n- 节点不超过 ${maxNodes} 个，优先保留标题与关键要点。\n- 节点标签尽量简短（<= 60 字），移除括号与多余标点。\n- 用 --> 连接顺序关系；有层级时父子用 --> 表达，兄弟按顺序并列。\n- 内容为空时输出：graph ${dir}\\n  A[未从 PDF 提取到有效文本]`;

  const userPrompt = `文档内容如下，请基于内容生成 Mermaid flowchart 代码（graph ${dir} 开头），遵守以上规则：\n\n${content}`;

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