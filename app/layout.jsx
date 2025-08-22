export const metadata = {
  title: 'PDF → Mermaid 生成器',
  description: '根据 PDF 文本生成 Mermaid 流程图代码',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial' }}>
        {children}
      </body>
    </html>
  );
}