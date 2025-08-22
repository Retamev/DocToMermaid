"use client";
import { useRouter } from "next/navigation";
import { useTheme, ThemeToggle } from "../../../contexts/ThemeContext";

export default function GuideModesPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 'clamp(16px, 4vw, 32px)' }}>
      {/* 头部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(20px, 5vw, 30px)', paddingBottom: 'clamp(16px, 4vw, 20px)', borderBottom: '1px solid var(--border-primary)', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 16px)', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: '1.2' }}>📥 输入模式</h1>
          <ThemeToggle size="medium" />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/guide')} style={btnStyle}>← 返回指南</button>
          <button onClick={() => router.push('/')} style={btnStyle}>← 返回主页</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(20px, 5vw, 40px)' }}>
        {/* PDF 上传模式 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={h2Style}>📄 PDF 上传模式</h2>
          <ul style={ulStyle}>
            <li>适用：包含结构化流程、架构图、系统说明的 PDF 文档</li>
            <li>支持多页与大文档处理，自动分段聚合，保持整体一致性</li>
            <li>图像 + 文本联合解析，提升复杂图表的还原度</li>
          </ul>
        </section>

        {/* 图片上传模式 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={h2Style}>🖼️ 图片 上传模式</h2>
          <ul style={ulStyle}>
            <li>适用：从白板、截图、手绘草图快速生成流程图</li>
            <li>客户端会自动压缩：最大边 1536 像素（等比缩放），质量约 0.9，尽量保真同时减少带宽</li>
            <li>支持粘贴 DataURL 或文件选择上传</li>
          </ul>
        </section>

        {/* 最佳实践 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={h2Style}>🧩 最佳实践</h2>
          <ul style={ulStyle}>
            <li>图像尽量保证清晰、对比度足够；避免过度压缩导致识别困难</li>
            <li>PDF 中的复杂图表可先导出为图片进行“图片上传”，通常更易于识别</li>
            <li>生成的 Mermaid 建议人工快速审阅与微调，保证业务语义准确</li>
          </ul>
        </section>

        {/* 常见问题 */}
        <section>
          <h2 style={h2Style}>❓ 常见问题</h2>
          <ul style={ulStyle}>
            <li>上传失败：请检查网络或尝试更换浏览器；必要时可降低图片分辨率后重试</li>
            <li>识别偏差：尝试切换到深色主题或调整图像对比度再上传</li>
            <li>导出过大：SVG 优先，小尺寸展示时 PNG 更直观</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-primary)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: 'clamp(12px, 3vw, 14px)',
  fontWeight: 500,
};

const h2Style = {
  fontSize: 'clamp(18px, 4vw, 24px)',
  fontWeight: 600,
  marginBottom: 'clamp(12px, 3vw, 16px)',
  color: 'var(--accent-primary)',
  lineHeight: '1.3'
};

const ulStyle = {
  fontSize: '16px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  paddingLeft: 'clamp(16px, 4vw, 20px)'
};