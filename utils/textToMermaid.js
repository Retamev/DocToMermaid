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
  const chartType = options.chartType || 'mermaid';

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
    return generateEmptyChart(chartType, dir);
  }

  return generateChartCode(chartType, dir, nodes);
}

// 生成空图表代码
function generateEmptyChart(chartType, dir) {
  switch (chartType) {
    case 'mindmap':
      return `mindmap\n  root((未从 PDF 提取到有效文本))\n`;
    case 'timeline':
      return `timeline\n  title 未从 PDF 提取到有效文本\n`;
    case 'gantt':
      return `gantt\n  title 未从 PDF 提取到有效文本\n  section 默认\n  任务1 :done, task1, 2024-01-01, 1d\n`;
    case 'orgchart':
      return `graph TB\n  A[未从 PDF 提取到有效文本]\n`;
    default:
      return `graph ${dir}\n  A[未从 PDF 提取到有效文本]\n`;
  }
}

// 根据图表类型生成代码
function generateChartCode(chartType, dir, nodes) {
  switch (chartType) {
    case 'mindmap':
      return generateMindmapCode(nodes);
    case 'timeline':
      return generateTimelineCode(nodes);
    case 'gantt':
      return generateGanttCode(nodes);
    case 'orgchart':
      return generateOrgchartCode(nodes);
    case 'network':
      return generateNetworkCode(nodes);
    default:
      return generateFlowchartCode(dir, nodes);
  }
}

// 生成流程图代码（默认）
function generateFlowchartCode(dir, nodes) {
  let code = `graph ${dir}\n`;
  for (const node of nodes) {
    code += `  ${node.id}[${escapeLabel(node.label)}]\n`;
  }
  for (let i = 0; i < nodes.length - 1; i++) {
    code += `  ${nodes[i].id} --> ${nodes[i + 1].id}\n`;
  }
  return code;
}

// 生成思维导图代码
function generateMindmapCode(nodes) {
  if (nodes.length === 0) return 'mindmap\n  root((空))\n';
  
  let code = `mindmap\n  root((${escapeLabel(nodes[0].label)}))\n`;
  for (let i = 1; i < nodes.length; i++) {
    code += `    ${nodes[i].id}[${escapeLabel(nodes[i].label)}]\n`;
  }
  return code;
}

// 生成时间轴代码
function generateTimelineCode(nodes) {
  let code = `timeline\n  title 文档时间轴\n`;
  for (const node of nodes) {
    code += `  ${node.label}\n`;
  }
  return code;
}

// 生成甘特图代码
function generateGanttCode(nodes) {
  let code = `gantt\n  title 项目进度\n  section 任务\n`;
  for (let i = 0; i < nodes.length; i++) {
    const startDate = new Date(2024, 0, i + 1).toISOString().split('T')[0];
    code += `  ${escapeLabel(nodes[i].label)} :task${i + 1}, ${startDate}, 1d\n`;
  }
  return code;
}

// 生成组织架构图代码
function generateOrgchartCode(nodes) {
  let code = `graph TB\n`;
  for (const node of nodes) {
    code += `  ${node.id}[${escapeLabel(node.label)}]\n`;
  }
  // 创建层级结构
  for (let i = 0; i < nodes.length - 1; i++) {
    code += `  ${nodes[0].id} --> ${nodes[i + 1].id}\n`;
  }
  return code;
}

// 生成网络拓扑图代码
function generateNetworkCode(nodes) {
  let code = `graph LR\n`;
  for (const node of nodes) {
    code += `  ${node.id}[${escapeLabel(node.label)}]\n`;
  }
  // 创建网络连接
  for (let i = 0; i < nodes.length - 1; i++) {
    code += `  ${nodes[i].id} --- ${nodes[i + 1].id}\n`;
  }
  return code;
}