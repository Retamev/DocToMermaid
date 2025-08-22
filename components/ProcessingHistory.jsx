'use client';
import { useState, useEffect } from 'react';

/**
 * 处理历史数据管理组件
 * 显示历史处理记录，分析预估准确性，支持数据清理
 */
export default function ProcessingHistory({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [filterStrategy, setFilterStrategy] = useState('all');

  // 获取历史数据
  const loadHistory = () => {
    try {
      const data = localStorage.getItem('mermaid_processing_history');
      const historyData = data ? JSON.parse(data) : [];
      setHistory(historyData.sort((a, b) => b.timestamp - a.timestamp));
      calculateStats(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
    }
  };

  // 计算统计信息
  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats(null);
      return;
    }

    const strategies = {};
    let totalAccuracy = 0;
    let totalEstimated = 0;
    let totalActual = 0;
    let accurateCount = 0; // 准确率>80%的记录数

    data.forEach(record => {
      const strategy = record.strategy || 'unknown';
      if (!strategies[strategy]) {
        strategies[strategy] = {
          count: 0,
          totalAccuracy: 0,
          avgEstimated: 0,
          avgActual: 0,
          accurateCount: 0,
        };
      }

      strategies[strategy].count++;
      strategies[strategy].totalAccuracy += record.accuracy || 0;
      strategies[strategy].avgEstimated += record.estimatedTime || 0;
      strategies[strategy].avgActual += record.actualTime || 0;
      
      if ((record.accuracy || 0) > 80) {
        strategies[strategy].accurateCount++;
        accurateCount++;
      }

      totalAccuracy += record.accuracy || 0;
      totalEstimated += record.estimatedTime || 0;
      totalActual += record.actualTime || 0;
    });

    // 计算每个策略的平均值
    Object.keys(strategies).forEach(strategy => {
      const s = strategies[strategy];
      s.avgAccuracy = s.totalAccuracy / s.count;
      s.avgEstimated = s.avgEstimated / s.count;
      s.avgActual = s.avgActual / s.count;
      s.accurateRate = (s.accurateCount / s.count) * 100;
    });

    setStats({
      totalRecords: data.length,
      avgAccuracy: totalAccuracy / data.length,
      avgEstimated: totalEstimated / data.length,
      avgActual: totalActual / data.length,
      accurateRate: (accurateCount / data.length) * 100,
      strategies,
      oldestRecord: new Date(Math.min(...data.map(r => r.timestamp))),
      newestRecord: new Date(Math.max(...data.map(r => r.timestamp))),
    });
  };

  // 清理历史数据
  const clearHistory = () => {
    if (confirm('确定要清除所有历史处理记录吗？这将重置预估算法的学习数据。')) {
      localStorage.removeItem('mermaid_processing_history');
      setHistory([]);
      setStats(null);
    }
  };

  // 删除单条记录
  const deleteRecord = (timestamp) => {
    const newHistory = history.filter(r => r.timestamp !== timestamp);
    setHistory(newHistory);
    localStorage.setItem('mermaid_processing_history', JSON.stringify(newHistory));
    calculateStats(newHistory);
  };

  // 导出历史数据
  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mermaid-processing-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 过滤和排序历史记录
  const getFilteredHistory = () => {
    let filtered = history;
    
    if (filterStrategy !== 'all') {
      filtered = history.filter(r => r.strategy === filterStrategy);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'accuracy':
          return (b.accuracy || 0) - (a.accuracy || 0);
        case 'actualTime':
          return (b.actualTime || 0) - (a.actualTime || 0);
        case 'pages':
          return (b.pages || 0) - (a.pages || 0);
        case 'fileSizeMB':
          return (b.fileSizeMB || 0) - (a.fileSizeMB || 0);
        default:
          return b.timestamp - a.timestamp;
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredHistory = getFilteredHistory();
  const strategies = stats ? Object.keys(stats.strategies) : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}>
        {/* 标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px',
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>📊 处理历史分析</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {/* 统计概览 */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {stats.totalRecords}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>总处理次数</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {Math.round(stats.avgAccuracy)}%
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>平均预估准确率</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#fefce8',
              borderRadius: '8px',
              border: '1px solid #fde047',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#eab308' }}>
                {Math.round(stats.accurateRate)}%
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>高准确率记录占比</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#64748b' }}>
                {Math.round(stats.avgActual)}s
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>平均实际耗时</div>
            </div>
          </div>
        )}

        {/* 策略统计 */}
        {stats && strategies.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>各策略表现</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e5e7eb' }}>策略</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>次数</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>准确率</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>平均预估</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>平均实际</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>高准确率占比</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map(strategy => {
                    const s = stats.strategies[strategy];
                    return (
                      <tr key={strategy}>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontWeight: '500' }}>
                          {strategy}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          {s.count}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          border: '1px solid #e5e7eb', 
                          textAlign: 'center',
                          color: s.avgAccuracy > 80 ? '#10b981' : s.avgAccuracy > 60 ? '#f59e0b' : '#ef4444'
                        }}>
                          {Math.round(s.avgAccuracy)}%
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          {Math.round(s.avgEstimated)}s
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          {Math.round(s.avgActual)}s
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          {Math.round(s.accurateRate)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 控制栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="all">所有策略</option>
              {strategies.map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="timestamp">按时间排序</option>
              <option value="accuracy">按准确率排序</option>
              <option value="actualTime">按实际耗时排序</option>
              <option value="pages">按页数排序</option>
              <option value="fileSizeMB">按文件大小排序</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={exportHistory}
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
              📥 导出数据
            </button>
            
            <button
              onClick={clearHistory}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              🗑️ 清除历史
            </button>
          </div>
        </div>

        {/* 历史记录列表 */}
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {filteredHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
            }}>
              暂无处理记录
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {filteredHistory.map((record, index) => (
                <div
                  key={record.timestamp}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                    <button
                      onClick={() => deleteRecord(record.timestamp)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                      title="删除此记录"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    <div>
                      <strong>策略:</strong> {record.strategy}
                    </div>
                    <div>
                      <strong>页数:</strong> {record.pages}
                    </div>
                    <div>
                      <strong>大小:</strong> {record.fileSizeMB}MB
                    </div>
                    <div>
                      <strong>预估:</strong> {record.estimatedTime}s
                    </div>
                    <div>
                      <strong>实际:</strong> {record.actualTime}s
                    </div>
                    <div style={{
                      color: (record.accuracy || 0) > 80 ? '#10b981' : (record.accuracy || 0) > 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      <strong>准确率:</strong> {record.accuracy || 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}