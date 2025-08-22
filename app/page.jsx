'use client';
import { useState } from 'react';
import MermaidRenderer from '../components/MermaidRenderer';
import ProgressBar from '../components/ProgressBar';
import ProcessingHistory from '../components/ProcessingHistory';
import ChartTypeSelector from '../components/ChartTypeSelector';
import { ThemeToggle } from '../contexts/ThemeContext';

// 前端图片等比压缩至最大边 1536（fit: inside），质量约 0.9
async function resizeImageToDataURL(file, maxEdge = 1536, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const max = Math.max(w, h);
        const scale = max > maxEdge ? maxEdge / max : 1;
        const targetW = Math.max(1, Math.round(w * scale));
        const targetH = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas初始化失败')); return; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}


export default function HomePage() {
  const [file, setFile] = useState(null);
  const [direction, setDirection] = useState('TB'); // TB=vertical, LR=horizontal
  const [vision, setVision] = useState(true);
  const [mapReduce, setMapReduce] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [stats, setStats] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [processingStrategy, setProcessingStrategy] = useState('unknown');
  const [showHistory, setShowHistory] = useState(false);
  const [chartType, setChartType] = useState('mermaid');
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [inputMode, setInputMode] = useState('pdf'); // 'pdf' | 'image'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // 获取图表类型显示名称
  const getChartTypeName = (type) => {
    const typeNames = {
      'mermaid': 'Mermaid流程图',
      'flowchart': '标准流程图',
      'orgchart': '组织架构图',
      'mindmap': '思维导图',
      'network': '网络拓扑图',
      'timeline': '时间轴图',
      'gantt': '甘特图',
      'uml': 'UML类图'
    };
    return typeNames[type] || '图表';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    setStats(null);

    // 根据模式分别处理
    if (inputMode === 'pdf') {
      if (!file) {
        setError('请先选择 PDF 文件');
        return;
      }
      try {
        setLoading(true);
        const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
        setFileInfo({ name: file.name, fileSizeMB });

        // 预估策略
        let estimatedStrategy = 'fast';
        if (mapReduce === 'on' || (mapReduce === 'auto' && fileSizeMB > 5)) {
          estimatedStrategy = 'map-reduce';
        } else if (vision && fileSizeMB > 2) {
          estimatedStrategy = 'multimodal';
        } else if (!process.env.VOLC_API_KEY && !process.env.ARK_API_KEY) {
          estimatedStrategy = 'rule-based';
        }
        setProcessingStrategy(estimatedStrategy);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('direction', direction);
        formData.append('chartType', chartType);
        formData.append('vision', vision ? 'on' : 'off');
        formData.append('mapReduce', mapReduce);

        const res = await fetch('/api/convert', { method: 'POST', body: formData });
        const responseText = await res.text();
        if (!responseText || responseText.trim() === '') {
          throw new Error('服务器返回空响应，可能是环境变量未配置或服务异常');
        }
        let data;
        try { data = JSON.parse(responseText); } catch (jsonError) {
          console.error('JSON解析错误:', jsonError);
          console.error('响应内容:', responseText);
          throw new Error(`服务器响应格式错误: ${jsonError.message}`);
        }
        if (!res.ok) throw new Error(data?.error || '生成失败');

        setResult(data.mermaid || '');
        setStats(data.stats || null);
        if (data.stats) {
          setFileInfo(prev => ({
            ...prev,
            pages: data.stats.pages,
            words: data.stats.words,
            fileSizeMB: data.stats.fileSizeMB,
          }));
          setProcessingStrategy(data.stats.processingStrategy || estimatedStrategy);
        }
      } catch (err) {
        setError(err.message || '请求失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 图片模式
    if (!imageFile) {
      setError('请先选择 图片 文件');
      return;
    }
    try {
      setLoading(true);
      const dataUrl = await resizeImageToDataURL(imageFile, 1536, 0.9);
      const approxSizeMB = Math.round(((dataUrl.length * 3 / 4) / (1024 * 1024)) * 100) / 100;
      setFileInfo({ name: imageFile.name, fileSizeMB: approxSizeMB });
      setProcessingStrategy('image-vision');

      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl, direction, chartType })
      });
      const responseText = await res.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('服务器返回空响应');
      }
      let data;
      try { data = JSON.parse(responseText); } catch (jsonError) {
        console.error('JSON解析错误:', jsonError);
        console.error('响应内容:', responseText);
        throw new Error(`服务器响应格式错误: ${jsonError.message}`);
      }
      if (!res.ok) throw new Error(data?.error || '生成失败');

      setResult(data.mermaid || '');
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      alert('已复制到剪贴板');
    } catch (e) {
      alert('复制失败');
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', transition: 'background-color var(--transition-normal)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: 'var(--text-primary)' }}>PDF → Mermaid 生成器</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle size="medium" />
          <button
            onClick={() => window.location.href = '/guide'}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
            }}
          >
            📚 使用指南
          </button>
          <button
            onClick={() => setShowChartSelector(!showChartSelector)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
            }}
          >
            🎨 图表类型
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
            }}
          >
            📊 处理历史
          </button>
        </div>
      </div>

      {/* 页签切换：PDF / 图片 */}
      <div className="card" style={{ display: 'flex', gap: 8, padding: 8, marginBottom: 12, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
        <button
          type="button"
          onClick={() => { setInputMode('pdf'); setError(''); setResult(''); setStats(null); }}
          className={inputMode === 'pdf' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', fontWeight: 600 }}
        >
          📄 PDF上传
        </button>
        <button
          type="button"
          onClick={() => { setInputMode('image'); setError(''); setResult(''); setStats(null); }}
          className={inputMode === 'image' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', fontWeight: 600 }}
        >
          🖼️ 图片上传
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>上传 {inputMode === 'pdf' ? 'PDF' : '图片'}，支持多模态生成多种类型的图表代码。图表类型和方向可在上方图表类型选择器中配置。</p>

      {/* 图表类型选择器 */}
      {showChartSelector && (
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <ChartTypeSelector
            selectedType={chartType}
            onTypeChange={setChartType}
            selectedDirection={direction}
            onDirectionChange={setDirection}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          {inputMode === 'pdf' ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>选择 PDF 文件</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>多模态（Vision）</label>
                <label style={{ marginRight: 16, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={vision} onChange={(e) => setVision(e.target.checked)} style={{ marginRight: '6px' }} /> 启用图像+文本解析（智能采样页面，失败自动回退）
                </label>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>大文档处理策略</label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="radio" name="mapReduce" value="auto" checked={mapReduce === 'auto'} onChange={(e) => setMapReduce(e.target.value)} style={{ marginRight: '6px' }} /> 自动（&gt;10k字符或&gt; 20页时启用）
                  </label>
                  <label style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="radio" name="mapReduce" value="on" checked={mapReduce === 'on'} onChange={(e) => setMapReduce(e.target.value)} style={{ marginRight: '6px' }} /> 强制启用Map-Reduce
                  </label>
                  <label style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="radio" name="mapReduce" value="off" checked={mapReduce === 'off'} onChange={(e) => setMapReduce(e.target.value)} style={{ marginRight: '6px' }} /> 禁用
                  </label>
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 12, margin: '4px 0 0 0' }}>Map-Reduce适用于大型PDF文档，将文档分块处理后合并结果</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>选择 图片 文件</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setImageFile(f);
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => setImagePreview(reader.result?.toString() || '');
                      reader.readAsDataURL(f);
                    } else {
                      setImagePreview('');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
                {imagePreview && (
                  <div style={{ marginTop: 12 }}>
                    <img src={imagePreview} alt="预览" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-primary)' }} />
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 6 }}>将自动等比缩放至最大边 1536，质量约90%</p>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {loading ? '🔄 生成中…' : (inputMode === 'pdf' ? `🚀 生成${getChartTypeName(chartType)}代码` : `🚀 解析图片并生成${getChartTypeName(chartType)}代码`)}
          </button>
        </div>
      </form>

      {/* 进度条 */}
      <ProgressBar 
        isProcessing={loading}
        fileInfo={fileInfo}
        processingStrategy={processingStrategy}
        onComplete={() => {
          // 进度完成后的回调
          console.log('Processing completed');
        }}
      />

      {error && (
        <div className="card" style={{ 
          marginTop: 16, 
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ color: 'var(--error)', fontWeight: '500' }}>❌ 错误：{error}</div>
        </div>
      )}

      {result && (
        <section className="fade-in" style={{ marginTop: 24 }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>生成结果</h2>
              <button onClick={copy} className="btn-secondary" style={{ padding: '8px 16px' }}>📋 复制</button>
            </div>
            {stats && (
              <div style={{ color: 'var(--text-secondary)', marginTop: 0, fontSize: 14, lineHeight: 1.6 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>📄 文档信息：</strong>
                  页数 {stats.pages}，词数 {stats.words}，字符数 {stats.characters}，文件大小 {stats.fileSizeMB}MB
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>⚙️ 处理策略：</strong>{stats.processingStrategy} | 
                  AI <span style={{ color: stats.usedAI ? 'var(--success)' : 'var(--text-tertiary)' }}>{stats.usedAI ? '✓' : '✗'}</span> | 
                  多模态 <span style={{ color: stats.usedVision ? 'var(--success)' : 'var(--text-tertiary)' }}>{stats.usedVision ? '✓' : '✗'}</span> | 
                  Map-Reduce <span style={{ color: stats.usedMapReduce ? 'var(--success)' : 'var(--text-tertiary)' }}>{stats.usedMapReduce ? '✓' : '✗'}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>⚡ 性能：</strong>
                  处理时间 {stats.processingTimeMs}ms | 
                  缓存命中率 {stats.cache?.enabled ? `${Math.round(stats.cache.hitRate * 100)}%` : '未启用'}
                </div>
                {stats.routing && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    <strong>🧠 路由决策：</strong>{stats.routing.reason}
                    {stats.routing.complexity && (
                      <span> | 复杂度评分: {stats.routing.complexity.score}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Mermaid代码文本框 */}
            <details style={{ marginBottom: '16px' }}>
              <summary style={{ 
                cursor: 'pointer', 
                padding: '12px 16px', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                transition: 'all var(--transition-fast)'
              }}>
                📝 查看/编辑 Mermaid 代码
              </summary>
              <textarea 
                value={result} 
                readOnly 
                rows={12} 
                style={{ 
                  width: '100%', 
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace', 
                  fontSize: 13, 
                  padding: 16, 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-primary)', 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  marginTop: '8px',
                  resize: 'vertical'
                }} 
              />
            </details>
          
          {/* 高级图表渲染器 */}
          <MermaidRenderer code={result} direction={direction} />
          
            <div className="card" style={{ 
              marginTop: 16, 
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: 'var(--text-primary)' }}>🚀 DocToMermaid 智能文档解析引擎</strong></p>
                <p style={{ margin: '4px 0' }}>🧠 智能路由：根据文档复杂度自动选择最佳解析策略</p>
                <p style={{ margin: '4px 0' }}>🔄 Map-Reduce：大文档分块处理，突破上下文限制</p>
                <p style={{ margin: '4px 0' }}>👁️ 多模态增强：结合文本和图像信息，提升解析准确性</p>
                <p style={{ margin: '4px 0' }}>🎨 自动渲染：实时预览Mermaid图表，支持PNG/SVG导出</p>
                <p style={{ margin: '4px 0' }}>📊 智能进度：根据文档特征预估处理时间，实时显示进度</p>
                <p style={{ margin: '4px 0' }}>🌙 主题切换：支持白天/夜间模式，跟随系统设置</p>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* 处理历史弹窗 */}
      <ProcessingHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </main>
  );
}