export const metadata = {
  title: 'Trama',
  description: 'Notitias in diagrammata teximus ｜ 把信息织成图表',
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