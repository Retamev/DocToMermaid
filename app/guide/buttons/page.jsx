"use client";
import { useRouter } from "next/navigation";
import { useTheme, ThemeToggle } from "../../../contexts/ThemeContext";

export default function GuideButtonsPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 'clamp(16px, 4vw, 32px)'
    }}>
      {/* 头部导航 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(20px, 5vw, 30px)',
        paddingBottom: 'clamp(16px, 4vw, 20px)',
        borderBottom: '1px solid var(--border-primary)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 16px)', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: '1.2' }}>
            🔘 按钮与操作
          </h1>
          <ThemeToggle size="medium" />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/guide')} style={btnStyle}>← 返回指南</button>
          <button onClick={() => router.push('/')} style={btnStyle}>← 返回主页</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(20px, 5vw, 40px)' }}>
        {/* 快速上手 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={h2Style}>🚀 快速上手</h2>
          <ol style={olStyle}>
            <li>选择输入模式（PDF上传 或 图片上传）</li>
            <li>上传文件或粘贴图片，点击提交</li>
            <li>查看并复制生成的 Mermaid 代码</li>
            <li>需要分享或嵌入时，导出 PNG 或 SVG</li>
          </ol>
        </section>

        {/* 核心操作 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={h2Style}>🧭 核心操作</h2>
          <div style={gridStyle}>
            <Card title="📋 复制代码" items={["一键复制 Mermaid 代码","适合粘贴到 Markdown/Wiki/PRD"]} />
            <Card title="🖼️ 导出 PNG" items={["高分辨率（默认 4K）","位图适合文档或幻灯片"]} />
            <Card title="📄 导出 SVG" items={["矢量格式，缩放不失真","适合网页或印刷"]} />
            <Card title="🎨 主题切换" items={["明暗主题自动适配","导出时也会匹配当前主题"]} />
            <Card title="🧭 图表类型" items={["支持多个方位/布局","切换后自动重新渲染"]} />
            <Card title="🕘 处理历史" items={["最近转换记录","可快速回看与复制"]} />
            <Card title="📤 提交" items={["触发 AI 解析","若网络不稳定请重试"]} />
          </div>
        </section>

        {/* 导出建议 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={h2Style}>💡 导出建议</h2>
          <ul style={ulStyle}>
            <li>PPT/Word 报告：优先 PNG；若需高清打印考虑 SVG</li>
            <li>Web/Blog：优先 SVG；对旧系统兼容可提供 PNG 备选</li>
            <li>深色背景主题下导出，能增强对比度与可读性</li>
          </ul>
        </section>

        {/* 常见问题 */}
        <section>
          <h2 style={h2Style}>❓ 常见问题</h2>
          <ul style={ulStyle}>
            <li>导出尺寸：组件会自适应图表尺寸，PNG 为高分辨率输出</li>
            <li>渲染失败：请检查 Mermaid 语法或尝试切换主题</li>
            <li>复制失败：浏览器权限限制时，请手动选择文本复制</li>
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

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
  gap: 'clamp(12px, 3vw, 16px)'
};

const ulStyle = {
  fontSize: '16px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)'
};

const olStyle = {
  fontSize: '16px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
  paddingLeft: 'clamp(16px, 4vw, 20px)'
};

function Card({ title, items }) {
  return (
    <div className="card" style={{ padding: 'clamp(16px, 4vw, 20px)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
      <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: 600, marginBottom: 'clamp(8px, 2vw, 12px)', color: 'var(--text-primary)', lineHeight: '1.3' }}>{title}</h3>
      <ul style={{ ...ulStyle, margin: 0, paddingLeft: 'clamp(16px, 4vw, 20px)' }}>
        {items.map((it, idx) => (<li key={idx}>{it}</li>))}
      </ul>
    </div>
  );
}