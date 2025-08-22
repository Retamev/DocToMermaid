'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';

/**
 * Mermaid渲染组件
 * 支持自动渲染Mermaid代码并提供图片导出功能
 */
export default function MermaidRenderer({ code, direction = 'TB' }) {
  const mermaidRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // 初始化Mermaid配置
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#2563eb',
        lineColor: '#6b7280',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff',
      },
    });
  }, []);

  useEffect(() => {
    if (code && mermaidRef.current) {
      renderMermaid();
    }
  }, [code]);

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
          border: 2px dashed #ef4444;
          border-radius: 8px;
          background-color: #fef2f2;
          color: #dc2626;
          text-align: center;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        ">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">渲染错误</h3>
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

      // 使用html2canvas截图
      const canvas = await html2canvas(mermaidRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 高分辨率
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: svgElement.clientWidth,
        height: svgElement.clientHeight,
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
        color: '#6b7280',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
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
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Mermaid 图表预览</h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={renderMermaid}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🔄 重新渲染
          </button>
          
          <button
            onClick={copyToClipboard}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
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
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                📁 导出SVG
              </button>
              
              <button
                onClick={exportAsPNG}
                disabled={isExporting}
                style={{
                  padding: '6px 12px',
                  backgroundColor: isExporting ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
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
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          overflow: 'auto',
        }}
      />
      
      {/* 状态信息 */}
      {renderError && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          <strong>渲染错误：</strong>{renderError}
        </div>
      )}
      
      {isRendered && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#166534',
          fontSize: '14px',
        }}>
          ✅ 图表渲染成功！可以导出为PNG或SVG格式。
        </div>
      )}
    </div>
  );
}