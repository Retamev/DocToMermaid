export const metadata = {
  title: 'PDF → Mermaid 生成器',
  description: '根据 PDF 文本生成 Mermaid 流程图代码',
};

import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}