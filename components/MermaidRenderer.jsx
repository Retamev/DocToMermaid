'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 简化的Mermaid渲染器组件
 * 使用官方Mermaid.js库，稳定可靠
 */
export default function MermaidRenderer({ code, direction = 'TB' }) {
  const containerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const { isDark } = useTheme();
  const mermaidRef = useRef(null);

  // 预加载mermaid库
  useEffect(() => {
    const loadMermaid = async () => {
      if (!mermaidRef.current) {
        try {
          const mermaid = await import('mermaid');
          mermaidRef.current = mermaid.default;
        } catch (error) {
          console.error('Failed to load mermaid:', error);
        }
      }
    };
    loadMermaid();
  }, []);

  // 渲染图表
  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderChart = async () => {
      try {
        setRenderError(null);
        setIsRendered(false);
        setIsRendering(true);
        
        // 使用预加载的mermaid库，如果没有则动态导入
        let mermaid = mermaidRef.current;
        if (!mermaid) {
          const mermaidModule = await import('mermaid');
          mermaid = mermaidModule.default;
          mermaidRef.current = mermaid;
        }
        
        // 配置mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontSize: 16,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20
          }
        });

        // 清空容器，避免重复渲染
        containerRef.current.innerHTML = '';
        
        // 渲染图表
        const { svg } = await mermaid.render(
          `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          code
        );
        
        // 创建新的div容器来包含SVG，避免重复
        const svgContainer = document.createElement('div');
        svgContainer.innerHTML = svg;
        containerRef.current.appendChild(svgContainer);
        
        // 设置SVG样式
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.display = 'block';
          svgElement.style.margin = '0 auto';
        }
        
        setIsRendered(true);
        
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        setRenderError(error.message || '图表渲染失败');
        setIsRendered(false);
      } finally {
        setIsRendering(false);
      }
    };

    renderChart();
  }, [code, isDark, renderTrigger]);

  // 导出为PNG
  const exportAsPNG = async () => {
    if (!containerRef.current || !isRendered) return;

    try {
      setIsExporting(true);
      
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('未找到SVG元素');
      }

      // 使用SVG转Canvas的方法，避免html2canvas的iframe问题
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // 获取SVG的实际尺寸（从viewBox或width/height属性）
      let svgWidth, svgHeight;
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [x, y, width, height] = viewBox.split(' ').map(Number);
        svgWidth = width;
        svgHeight = height;
      } else {
        // 回退到getBoundingClientRect，但确保最小尺寸
        const rect = svgElement.getBoundingClientRect();
        svgWidth = Math.max(rect.width, 800);
        svgHeight = Math.max(rect.height, 600);
      }
      
      const scale = 4; // 4K质量
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      ctx.scale(scale, scale);
      
      // 设置背景色
       ctx.fillStyle = isDark ? '#1f2937' : '#ffffff';
       ctx.fillRect(0, 0, svgWidth, svgHeight);
       
       return new Promise((resolve, reject) => {
         img.onload = () => {
           try {
             ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const link = document.createElement('a');
                link.download = `mermaid-chart-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                resolve();
              } else {
                reject(new Error('无法创建PNG文件'));
              }
            }, 'image/png', 1.0);
          } catch (err) {
            reject(err);
          }
        };
        
        img.onerror = () => reject(new Error('SVG图像加载失败'));
        
        // 使用data URL避免CORS问题
         const encodedSvgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
         img.src = encodedSvgData;
      });
      
    } catch (error) {
      console.error('PNG导出失败:', error);
      alert('PNG导出失败: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // 导出为SVG
  const exportAsSVG = () => {
    if (!containerRef.current || !isRendered) return;
    
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) {
      alert('未找到SVG元素');
      return;
    }
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `mermaid-chart-${Date.now()}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // 复制代码到剪贴板
  const copyToClipboard = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      alert('Mermaid代码已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败: ' + error.message);
    }
  };

  // 重新渲染
  const reRender = () => {
    if (containerRef.current) {
      // 清空容器和重置状态
      containerRef.current.innerHTML = '';
      setIsRendered(false);
      setRenderError(null);
      // 通过更新renderTrigger触发useEffect重新执行
      setRenderTrigger(prev => prev + 1);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 控制面板 */}
      <div className="card" style={{
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minHeight: '80px'
      }}>
        <div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            📊 Mermaid图表渲染器
          </div>
          <div style={{ 
             fontSize: '14px', 
             color: 'var(--text-secondary)',
             marginBottom: '8px'
           }}>
             {isRendering ? '🔄 正在渲染...' : isRendered ? '✅ 渲染成功！支持4K PNG和矢量SVG导出。' : '⏳ 准备渲染...'}
           </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-tertiary)'
          }}>
            🎨 引擎：Mermaid.js官方库
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={exportAsSVG}
              disabled={!isRendered || isExporting}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: isRendered ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: isRendered ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: isRendered ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)'
              }}
            >
              导出矢量 SVG
            </button>
            <button
              onClick={exportAsPNG}
              disabled={!isRendered || isExporting}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: isRendered ? 'var(--success)' : 'var(--bg-tertiary)',
                color: isRendered ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: isRendered ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)'
              }}
            >
              {isExporting ? '导出中...' : '导出 PNG'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={reRender}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              🔄 重新渲染
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!code}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-secondary)',
                color: code ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                cursor: code ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)'
              }}
            >
              📋 复制代码
            </button>
          </div>
        </div>
      </div>

      {/* 错误显示 */}
      {renderError && (
        <div style={{
          padding: '20px',
          border: '2px dashed var(--error)',
          borderRadius: '8px',
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
          color: 'var(--error)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: '16px' }}>图表渲染失败</h3>
          </div>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            <strong>错误详情：</strong><br />
            {renderError}
          </div>
        </div>
      )}

      {/* 渲染容器 */}
      <div 
        ref={containerRef} 
        style={{
          width: '100%',
          minHeight: '200px',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}
      />

      {/* 功能说明 */}
      {!code && (
        <div className="card" style={{
          marginTop: '16px',
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Mermaid图表渲染器</h3>
          <p style={{ margin: '0 0 16px 0' }}>使用官方Mermaid.js库，稳定可靠的图表渲染</p>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div>✅ 支持标准Mermaid语法</div>
            <div>✅ 自动主题适配（明暗模式）</div>
            <div>✅ 高质量PNG和SVG导出</div>
            <div>✅ 简洁稳定的渲染引擎</div>
          </div>
        </div>
      )}
    </div>
  );
}