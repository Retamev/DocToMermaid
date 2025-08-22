'use client';
import { useState } from 'react';
import MermaidRenderer from '../components/MermaidRenderer';
import ProgressBar from '../components/ProgressBar';
import ProcessingHistory from '../components/ProcessingHistory';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    setStats(null);
    if (!file) {
      setError('请先选择 PDF 文件');
      return;
    }
    
    try {
      setLoading(true);
      
      // 设置文件信息用于进度条
      const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
      setFileInfo({
        name: file.name,
        fileSizeMB,
        // 页数和词数将在API响应后更新
      });
      
      // 根据配置预估处理策略
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
      formData.append('vision', vision ? 'on' : 'off');
      formData.append('mapReduce', mapReduce);
      
      const res = await fetch('/api/convert', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || '生成失败');
      }
      
      setResult(data.mermaid || '');
      setStats(data.stats || null);
      
      // 更新文件信息
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
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>PDF → Mermaid 生成器（MVP）</h1>
        <button
          onClick={() => setShowHistory(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📊 处理历史
        </button>
      </div>
      <p style={{ color: '#555', marginBottom: 24 }}>上传 PDF，选择图方向（横向/纵向），支持多模态（文本+页图像采样）生成 Mermaid flowchart 代码。</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>选择 PDF 文件</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>图方向</label>
          <label style={{ marginRight: 16 }}>
            <input type="radio" name="direction" value="TB" checked={direction === 'TB'} onChange={() => setDirection('TB')} /> 纵向（TB）
          </label>
          <label>
            <input type="radio" name="direction" value="LR" checked={direction === 'LR'} onChange={() => setDirection('LR')} /> 横向（LR）
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>多模态（Vision）</label>
          <label style={{ marginRight: 16 }}>
            <input type="checkbox" checked={vision} onChange={(e) => setVision(e.target.checked)} /> 启用图像+文本解析（智能采样页面，失败自动回退）
          </label>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>大文档处理策略</label>
          <div style={{ display: 'flex', gap: 16 }}>
            <label>
              <input type="radio" name="mapReduce" value="auto" checked={mapReduce === 'auto'} onChange={(e) => setMapReduce(e.target.value)} /> 自动（{'>'}10k字符或{'>'} 20页时启用）
            </label>
            <label>
              <input type="radio" name="mapReduce" value="on" checked={mapReduce === 'on'} onChange={(e) => setMapReduce(e.target.value)} /> 强制启用Map-Reduce
            </label>
            <label>
              <input type="radio" name="mapReduce" value="off" checked={mapReduce === 'off'} onChange={(e) => setMapReduce(e.target.value)} /> 禁用
            </label>
          </div>
          <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0 0' }}>Map-Reduce适用于大型PDF文档，将文档分块处理后合并结果</p>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 16px', background: '#111', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
          {loading ? '生成中…' : '生成 Mermaid 代码'}
        </button>
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
        <div style={{ marginTop: 16, color: '#b00020' }}>错误：{error}</div>
      )}

      {result && (
        <section style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 20 }}>生成结果</h2>
            <button onClick={copy} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, background: '#fafafa', cursor: 'pointer' }}>复制</button>
          </div>
          {stats && (
            <div style={{ color: '#666', marginTop: 0, fontSize: 14 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>文档信息：</strong>页数 {stats.pages}，词数 {stats.words}，字符数 {stats.characters}，文件大小 {stats.fileSizeMB}MB
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>处理策略：</strong>{stats.processingStrategy} | 
                AI {stats.usedAI ? '✓' : '✗'} | 
                多模态 {stats.usedVision ? '✓' : '✗'} | 
                Map-Reduce {stats.usedMapReduce ? '✓' : '✗'}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>性能：</strong>处理时间 {stats.processingTimeMs}ms | 
                缓存命中率 {stats.cache?.enabled ? `${Math.round(stats.cache.hitRate * 100)}%` : '未启用'}
              </div>
              {stats.routing && (
                <div style={{ fontSize: 12, color: '#888' }}>
                  <strong>路由决策：</strong>{stats.routing.reason}
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
              padding: '8px 12px', 
              backgroundColor: '#f1f5f9', 
              borderRadius: '6px',
              fontWeight: '600',
              color: '#475569'
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
                padding: 12, 
                borderRadius: 8, 
                border: '1px solid #ddd', 
                background: '#fff',
                marginTop: '8px'
              }} 
            />
          </details>
          
          {/* Mermaid渲染器 */}
          <MermaidRenderer code={result} direction={direction} />
          
          <div style={{ color: '#888', marginTop: 16, fontSize: 12 }}>
            <p><strong>DocToMermaid 智能文档解析引擎</strong></p>
            <p>• 智能路由：根据文档复杂度自动选择最佳解析策略</p>
            <p>• Map-Reduce：大文档分块处理，突破上下文限制</p>
            <p>• 多模态增强：结合文本和图像信息，提升解析准确性</p>
            <p>• 自动渲染：实时预览Mermaid图表，支持PNG/SVG导出</p>
            <p>• 智能进度：根据文档特征预估处理时间，实时显示进度</p>
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