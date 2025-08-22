function sanitizeLine(s) {
  return s
    .replace(/[\u2022\u25CF\-•·*>#]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max = 80) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)) + '…';
}

function escapeLabel(s) {
  // Mermaid 节点标签中避开方括号冲突
  return s.replace(/[\[\]]/g, '');
}

export function textToMermaid(text, direction = 'TB', options = {}) {
  const dir = direction === 'LR' ? 'LR' : 'TB';
  const maxNodes = Number(options.maxNodes || 50);

  const lines = (text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^contents$/i.test(l) && !/^目录$/i.test(l));

  const nodes = [];
  for (let i = 0; i < lines.length && nodes.length < maxNodes; i++) {
    const clean = sanitizeLine(lines[i]);
    if (!clean) continue;
    if (/^(第[一二三四五六七八九十百千]+章|Chapter\s+\d+)/i.test(clean)) {
      // 标题行保留
      nodes.push({ id: `N${nodes.length + 1}`, label: truncate(clean, 60) });
    } else if (clean.length > 5) {
      // 一般文本行（略过过短的噪音）
      nodes.push({ id: `N${nodes.length + 1}`, label: truncate(clean, 60) });
    }
  }

  if (nodes.length === 0) {
    return `graph ${dir}\n  A[未从 PDF 提取到有效文本]\n`;
  }

  let code = `graph ${dir}\n`;
  for (const node of nodes) {
    code += `  ${node.id}[${escapeLabel(node.label)}]\n`;
  }
  for (let i = 0; i < nodes.length - 1; i++) {
    code += `  ${nodes[i].id} --> ${nodes[i + 1].id}\n`;
  }
  return code;
}