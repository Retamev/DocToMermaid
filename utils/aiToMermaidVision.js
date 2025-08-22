import OpenAI from 'openai';

function ensureMermaidPrefix(code, dir) {
  if (!code || !code.trim()) return `graph ${dir}\n  A[未从 PDF 提取到有效文本]\n`;
  if (!/^graph\s+(TB|LR|BT|RL)/i.test(code)) {
    return `graph ${dir}\n` + code.trim() + (code.endsWith('\n') ? '' : '\n');
  }
  return code;
}

/**
 * Ask multimodal model to produce Mermaid from combined text + sampled page images
 */
export async function aiGenerateMermaidVision({ text, images = [], direction = 'TB', maxNodes = 60 }) {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) throw new Error('Missing ARK_API_KEY');

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  const dir = direction === 'LR' ? 'LR' : 'TB';
  const content = (text || '').slice(0, 20000);

  const systemPrompt = `你是将 PDF 内容（文本+页面截图）提炼为 Mermaid flowchart 的专家。严格遵守：\n- 仅输出 Mermaid 代码，不要解释、不要包裹代码块。\n- 使用 graph ${dir} 开头。\n- 节点不超过 ${maxNodes} 个，优先标题与关键要点。\n- 标签简短（<= 60 字），移除冗余标点/括号。\n- 顺序/层级关系均用 --> 表达。\n- 如无法读取有效信息，输出 graph ${dir}\\n  A[未从 PDF 提取到有效文本]`;

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