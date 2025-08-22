'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 智能进度条组件
 * 根据文件大小和页数估算处理时间，显示动态进度
 */
export default function ProgressBar({ 
  isProcessing, 
  fileInfo = null, 
  processingStrategy = 'unknown',
  onComplete = null 
}) {
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [stages, setStages] = useState([]);

  // 处理阶段定义
  const PROCESSING_STAGES = {
    'rule-based': [
      { name: 'PDF解析', weight: 30, duration: 2 },
      { name: '文本提取', weight: 20, duration: 1 },
      { name: '规则分析', weight: 30, duration: 2 },
      { name: '生成Mermaid', weight: 20, duration: 1 },
    ],
    'fast': [
      { name: 'PDF解析', weight: 25, duration: 2 },
      { name: '文本提取', weight: 15, duration: 1 },
      { name: 'AI分析', weight: 40, duration: 4 },
      { name: '生成Mermaid', weight: 20, duration: 2 },
    ],
    'multimodal': [
      { name: 'PDF解析', weight: 20, duration: 3 },
      { name: '页面渲染', weight: 25, duration: 5 },
      { name: '多模态分析', weight: 35, duration: 8 },
      { name: '生成Mermaid', weight: 20, duration: 3 },
    ],
    'map-reduce': [
      { name: 'PDF解析', weight: 15, duration: 3 },
      { name: '文档分块', weight: 10, duration: 2 },
      { name: 'Map处理', weight: 40, duration: 12 },
      { name: 'Reduce合并', weight: 25, duration: 6 },
      { name: '生成Mermaid', weight: 10, duration: 2 },
    ],
  };

  // 从localStorage获取历史处理数据
  const getHistoricalData = () => {
    try {
      const data = localStorage.getItem('mermaid_processing_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // 保存处理数据到localStorage
  const saveProcessingData = (data) => {
    try {
      const history = getHistoricalData();
      history.push({
        ...data,
        timestamp: Date.now(),
      });
      // 只保留最近50条记录
      const recentHistory = history.slice(-50);
      localStorage.setItem('mermaid_processing_history', JSON.stringify(recentHistory));
    } catch (error) {
      console.warn('Failed to save processing data:', error);
    }
  };

  // 基于历史数据的智能时间预估
  const estimateProcessingTime = (fileInfo, strategy) => {
    if (!fileInfo) return 15; // 默认15秒

    const { pages = 1, fileSizeMB = 1, words = 1000 } = fileInfo;
    const baseStages = PROCESSING_STAGES[strategy] || PROCESSING_STAGES['fast'];
    
    // 获取历史数据进行学习
    const history = getHistoricalData();
    const relevantHistory = history.filter(h => 
      h.strategy === strategy && 
      Math.abs(h.pages - pages) <= Math.max(5, pages * 0.3) &&
      Math.abs(h.fileSizeMB - fileSizeMB) <= Math.max(1, fileSizeMB * 0.5)
    );

    // 如果有相关历史数据，使用机器学习方法
    if (relevantHistory.length >= 3) {
      const avgActualTime = relevantHistory.reduce((sum, h) => sum + h.actualTime, 0) / relevantHistory.length;
      const avgEstimatedTime = relevantHistory.reduce((sum, h) => sum + h.estimatedTime, 0) / relevantHistory.length;
      
      // 计算历史预估的准确性因子
      const accuracyFactor = avgActualTime / Math.max(avgEstimatedTime, 1);
      
      // 基于相似文件的加权平均
      let weightedTime = 0;
      let totalWeight = 0;
      
      relevantHistory.forEach(h => {
        const pageSimilarity = 1 / (1 + Math.abs(h.pages - pages) / Math.max(pages, 1));
        const sizeSimilarity = 1 / (1 + Math.abs(h.fileSizeMB - fileSizeMB) / Math.max(fileSizeMB, 1));
        const weight = pageSimilarity * sizeSimilarity;
        
        weightedTime += h.actualTime * weight;
        totalWeight += weight;
      });
      
      if (totalWeight > 0) {
        const historicalEstimate = weightedTime / totalWeight;
        // 结合历史数据和基础算法
        const baseEstimate = calculateBaseEstimate(fileInfo, strategy, baseStages);
        return Math.round((historicalEstimate * 0.7 + baseEstimate * accuracyFactor * 0.3));
      }
    }
    
    // 没有足够历史数据时，使用改进的基础算法
    return calculateBaseEstimate(fileInfo, strategy, baseStages);
  };

  // 改进的基础时间估算算法
  const calculateBaseEstimate = (fileInfo, strategy, baseStages) => {
    const { pages = 1, fileSizeMB = 1, words = 1000 } = fileInfo;
    
    // 基础时间计算
    let baseTime = baseStages.reduce((sum, stage) => sum + stage.duration, 0);
    
    // 更精确的文件特征因子计算
    const pagesFactor = Math.max(1, 1 + Math.log2(pages + 1) * 0.3);
    const sizeFactor = Math.max(1, 1 + Math.log2(fileSizeMB + 1) * 0.4);
    const wordsFactor = Math.max(1, 1 + Math.log2(words / 1000 + 1) * 0.2);
    
    // 复杂度因子（基于文本密度）
    const textDensity = words / Math.max(pages, 1);
    const complexityFactor = Math.max(1, 1 + Math.log2(textDensity / 500 + 1) * 0.15);
    
    // 策略特定的时间调整（基于实际测试数据优化）
    const strategyMultipliers = {
      'rule-based': 0.8,
      'fast': 1.5,
      'multimodal': 3.2,
      'map-reduce': 4.5,
      'ai-fallback': 2.0,
    };
    
    const strategyMultiplier = strategyMultipliers[strategy] || 2.0;
    
    // 网络延迟和API调用开销
    const networkOverhead = strategy.includes('ai') || strategy === 'multimodal' ? 5 : 2;
    
    const estimatedSeconds = (baseTime * pagesFactor * sizeFactor * wordsFactor * complexityFactor * strategyMultiplier) + networkOverhead;
    
    return Math.max(8, Math.min(180, Math.round(estimatedSeconds))); // 限制在8-180秒之间
  };

  // 初始化进度条
  useEffect(() => {
    if (isProcessing && fileInfo) {
      const strategy = processingStrategy || 'fast';
      const estimated = estimateProcessingTime(fileInfo, strategy);
      const stageList = PROCESSING_STAGES[strategy] || PROCESSING_STAGES['fast'];
      
      setEstimatedTime(estimated);
      setStages(stageList);
      setProgress(0);
      setElapsedTime(0);
      setCurrentStage(stageList[0]?.name || '处理中');
    } else if (!isProcessing) {
      setProgress(0);
      setElapsedTime(0);
      setCurrentStage('');
    }
  }, [isProcessing, fileInfo, processingStrategy]);

  // 进度更新逻辑
  useEffect(() => {
    if (!isProcessing || estimatedTime === 0) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = prev + 0.1;
        
        // 计算当前进度（使用非线性增长）
        const progressRatio = newElapsed / estimatedTime;
        let newProgress;
        
        if (progressRatio < 0.7) {
          // 前70%时间内，进度达到80%
          newProgress = (progressRatio / 0.7) * 80;
        } else if (progressRatio < 0.9) {
          // 70%-90%时间内，进度从80%到95%
          newProgress = 80 + ((progressRatio - 0.7) / 0.2) * 15;
        } else {
          // 最后10%时间内，进度从95%到99%
          newProgress = 95 + ((progressRatio - 0.9) / 0.1) * 4;
        }
        
        setProgress(Math.min(99, newProgress));
        
        // 更新当前阶段
        let cumulativeWeight = 0;
        for (const stage of stages) {
          cumulativeWeight += stage.weight;
          if (newProgress < cumulativeWeight) {
            setCurrentStage(stage.name);
            break;
          }
        }
        
        return newElapsed;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, estimatedTime, stages]);

  // 处理完成
  useEffect(() => {
    if (!isProcessing && progress > 0) {
      setProgress(100);
      setCurrentStage('完成');
      
      // 保存实际处理时间用于学习（只保存一次）
      if (fileInfo && processingStrategy && estimatedTime > 0 && elapsedTime > 0) {
        const actualTime = Math.round(elapsedTime);
        const processingKey = `${fileInfo.pages}-${fileInfo.fileSizeMB}-${processingStrategy}-${Math.round(estimatedTime)}`;
        
        // 检查是否已经保存过相同的处理记录
        const existingData = getHistoricalData();
        const isDuplicate = existingData.some(record => {
          const recordKey = `${record.pages}-${record.fileSizeMB}-${record.strategy}-${record.estimatedTime}`;
          const timeDiff = Math.abs(record.timestamp - Date.now());
          return recordKey === processingKey && timeDiff < 10000; // 10秒内的相同记录视为重复
        });
        
        if (!isDuplicate) {
          saveProcessingData({
            pages: fileInfo.pages || 1,
            fileSizeMB: fileInfo.fileSizeMB || 1,
            words: fileInfo.words || 1000,
            strategy: processingStrategy,
            estimatedTime: Math.round(estimatedTime),
            actualTime: actualTime,
            accuracy: actualTime > 0 ? Math.round((Math.min(estimatedTime, actualTime) / Math.max(estimatedTime, actualTime)) * 100) : 0,
          });
          
          // 在控制台输出学习信息（开发调试用）
          console.log(`Processing completed: Estimated ${Math.round(estimatedTime)}s, Actual ${actualTime}s, Accuracy: ${Math.round((Math.min(estimatedTime, actualTime) / Math.max(estimatedTime, actualTime)) * 100)}%`);
        } else {
          console.log('Duplicate processing record detected, skipping save.');
        }
      }
      
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }
  }, [isProcessing, progress, onComplete, fileInfo, processingStrategy, estimatedTime, elapsedTime]);

  if (!isProcessing && progress === 0) {
    return null;
  }

  const remainingTime = Math.max(0, estimatedTime - elapsedTime);
  const progressPercentage = Math.round(progress);

  return (
    <div className="card" style={{
      margin: '20px 0',
      padding: '20px',
    }}>
      {/* 进度信息 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isProcessing ? '🔄 处理中...' : '✅ 处理完成'}
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            当前阶段：{currentStage}
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)' }}>
            {progressPercentage}%
          </div>
          {isProcessing && remainingTime > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              预计剩余：{Math.ceil(remainingTime)}秒
            </div>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        marginBottom: '12px',
        border: '1px solid var(--border-primary)',
      }}>
        <div
          style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: isProcessing ? 'var(--accent-primary)' : 'var(--success)',
            borderRadius: 'var(--radius-sm)',
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
            background: isProcessing 
              ? 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              : 'linear-gradient(90deg, var(--success) 0%, var(--success-dark) 100%)',
          }}
        />
      </div>

      {/* 阶段指示器 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-secondary)',
      }}>
        {stages.map((stage, index) => {
          let cumulativeWeight = 0;
          for (let i = 0; i <= index; i++) {
            cumulativeWeight += stages[i].weight;
          }
          
          const isActive = currentStage === stage.name;
          const isCompleted = progress > cumulativeWeight;
          
          return (
            <div
              key={stage.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: isActive ? 1 : (isCompleted ? 0.8 : 0.5),
                fontWeight: isActive ? '600' : '400',
                color: isActive ? 'var(--accent-primary)' : (isCompleted ? 'var(--success)' : 'var(--text-secondary)'),
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--accent-primary)' : (isCompleted ? 'var(--success)' : 'var(--border-secondary)'),
                marginBottom: '4px',
              }} />
              <span>{stage.name}</span>
            </div>
          );
        })}
      </div>

      {/* 处理详情 */}
      {fileInfo && (
        <div className="card" style={{
          marginTop: '16px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--text-primary)' }}>处理信息：</strong>
            页数 {fileInfo.pages}，大小 {fileInfo.fileSizeMB}MB，
            策略 {processingStrategy}，
            预计耗时 {Math.round(estimatedTime)}秒
            {(() => {
              const history = getHistoricalData();
              const relevantHistory = history.filter(h => h.strategy === processingStrategy);
              if (relevantHistory.length > 0) {
                const avgAccuracy = relevantHistory.reduce((sum, h) => sum + (h.accuracy || 0), 0) / relevantHistory.length;
                const confidenceLevel = relevantHistory.length >= 10 ? '高' : relevantHistory.length >= 5 ? '中' : '低';
                return (
                  <span style={{ marginLeft: '8px', color: avgAccuracy > 80 ? 'var(--success)' : avgAccuracy > 60 ? 'var(--warning)' : 'var(--error)' }}>
                    （预估可信度: {confidenceLevel}，历史准确率: {Math.round(avgAccuracy)}%，基于 {relevantHistory.length} 次记录）
                  </span>
                );
              }
              return <span style={{ marginLeft: '8px', color: 'var(--text-tertiary)' }}>（首次处理此类文档）</span>;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}