'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Mermaid渲染组件
 * 支持自动渲染Mermaid代码并提供图片导出功能
 */
export default function MermaidRenderer({ code, direction = 'TB' }) {
  const mermaidRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // 根据主题初始化Mermaid配置
    const mermaidTheme = isDark ? 'dark' : 'default';
    const themeVariables = isDark ? {
      primaryColor: '#3b82f6',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#1d4ed8',
      lineColor: '#cbd5e1',
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a',
      background: '#0f172a',
      mainBkg: '#1e293b',
      secondBkg: '#334155',
      tertiaryBkg: '#475569',
    } : {
      primaryColor: '#3b82f6',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#2563eb',
      lineColor: '#6b7280',
      secondaryColor: '#f3f4f6',
      tertiaryColor: '#ffffff',
      background: '#ffffff',
      mainBkg: '#ffffff',
      secondBkg: '#f8fafc',
      tertiaryBkg: '#f1f5f9',
    };

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      fontSize: 16, // 增加字体大小提高清晰度
      flowchart: {
        useMaxWidth: false, // 禁用最大宽度限制，保持原始尺寸
        htmlLabels: true,
        curve: 'basis',
        padding: 20, // 增加内边距
      },
      themeVariables,
      // 添加高分辨率配置
      look: 'handDrawn',
      wrap: true,
      maxTextSize: 90000,
    });
  }, [isDark]);

  useEffect(() => {
    if (code && mermaidRef.current) {
      renderMermaid();
    }
  }, [code, theme]);

  const renderMermaid = async () => {
    if (!mermaidRef.current || !code) return;

    try {
      setRenderError(null);
      setIsRendered(false);
      
      // 清空之前的内容
      mermaidRef.current.innerHTML = '';
      
      // 生成唯一ID
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 验证Mermaid语法
      const isValid = await mermaid.parse(code);
      if (!isValid) {
        throw new Error('Invalid Mermaid syntax');
      }

      // 渲染Mermaid图表
      const { svg } = await mermaid.render(id, code);
      
      // 插入SVG到DOM
      mermaidRef.current.innerHTML = svg;
      
      // 设置SVG样式
      const svgElement = mermaidRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.display = 'block';
        svgElement.style.margin = '0 auto';
      }
      
      setIsRendered(true);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      setRenderError(error.message || 'Failed to render Mermaid diagram');
      
      // 显示错误信息
      mermaidRef.current.innerHTML = `
        <div style="
          padding: 20px;
          border: 2px dashed var(--error);
          border-radius: var(--radius-md);
          background-color: ${isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'};
          color: var(--error);
          text-align: center;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        ">
          <h3 style="margin: 0 0 10px 0; color: var(--error);">渲染错误</h3>
          <p style="margin: 0; font-size: 14px;">${error.message}</p>
        </div>
      `;
    }
  };

  const exportAsPNG = async () => {
    if (!mermaidRef.current || !isRendered) return;

    try {
      setIsExporting(true);
      
      const svgElement = mermaidRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('No SVG element found');
      }

      // 使用html2canvas截图，提高分辨率
      const canvas = await html2canvas(mermaidRef.current, {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        scale: 4, // 提高到4倍分辨率
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: svgElement.clientWidth,
        height: svgElement.clientHeight,
        // 添加高质量渲染选项
        dpi: 300, // 设置DPI为300
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: true,
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `mermaid-diagram-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('导出失败：' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsSVG = () => {
    if (!mermaidRef.current || !isRendered) return;

    try {
      const svgElement = mermaidRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('No SVG element found');
      }

      // 获取SVG内容
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `mermaid-diagram-${Date.now()}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      console.error('SVG export error:', error);
      alert('SVG导出失败：' + error.message);
    }
  };

  const copyToClipboard = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      alert('Mermaid代码已复制到剪贴板');
    } catch (error) {
      console.error('Copy error:', error);
      alert('复制失败');
    }
  };

  if (!code) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        border: '2px dashed var(--border-secondary)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <p>暂无Mermaid代码可渲染</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '24px' }}>
      {/* 控制按钮 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Mermaid 图表预览</h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
              onClick={renderMermaid}
              className="btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '14px',
              }}
            >
              🔄 重新渲染
            </button>
            
            <button
              onClick={copyToClipboard}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '14px',
              }}
            >
              📋 复制代码
            </button>
          
          {isRendered && (
            <>
              <button
                onClick={exportAsSVG}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                📁 导出SVG
              </button>
              
              <button
                onClick={exportAsPNG}
                disabled={isExporting}
                style={{
                  padding: '6px 12px',
                  backgroundColor: isExporting ? 'var(--text-tertiary)' : 'var(--warning)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all var(--transition-fast)',
                  opacity: isExporting ? 0.6 : 1,
                }}
              >
                {isExporting ? '🔄 导出中...' : '🖼️ 导出PNG'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 渲染区域 */}
      <div
        ref={mermaidRef}
        style={{
          minHeight: '200px',
          padding: '20px',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
          overflow: 'auto',
          transition: 'all var(--transition-normal)',
          // 优化SVG渲染质量
          imageRendering: 'crisp-edges',
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision',
        }}
      />
      
      {/* 状态信息 */}
      {renderError && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--error)',
          fontSize: '14px',
        }}>
          <strong>渲染错误：</strong>{renderError}
        </div>
      )}
      
      {isRendered && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--success)',
          fontSize: '14px',
        }}>
          ✅ 图表渲染成功！可以导出为PNG或SVG格式。
        </div>
      )}
    </div>
  );
}