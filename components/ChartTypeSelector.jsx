'use client';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 简化的图表类型选择器组件
 * 专注于基础Mermaid图表类型
 */
export default function ChartTypeSelector({ 
  selectedType = 'mermaid', 
  onTypeChange = () => {},
  onDirectionChange = () => {},
  selectedDirection = 'TB'
}) {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // 简化的图表类型配置
  const CHART_TYPES = {
    mermaid: {
      name: 'Mermaid流程图',
      description: '标准Mermaid语法流程图',
      icon: '🔄',
      supportedDirections: ['TB', 'LR', 'BT', 'RL'],
      defaultDirection: 'TB'
    },
    flowchart: {
      name: '流程图',
      description: '基础流程图表',
      icon: '📊',
      supportedDirections: ['TB', 'LR'],
      defaultDirection: 'TB'
    }
  };

  const currentConfig = CHART_TYPES[selectedType] || CHART_TYPES.mermaid;

  const handleTypeSelect = (type) => {
    onTypeChange(type);
    const config = CHART_TYPES[type];
    if (config && !config.supportedDirections.includes(selectedDirection)) {
      onDirectionChange(config.defaultDirection);
    }
    setIsExpanded(false);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* 当前选择显示 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'var(--bg-secondary)';
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{currentConfig?.icon || '📊'}</span>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentConfig?.name || '未知图表类型'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {currentConfig?.description || '无描述'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 方向选择器 */}
          {currentConfig?.supportedDirections.length > 1 && (
            <select
              value={selectedDirection}
              onChange={(e) => {
                e.stopPropagation();
                onDirectionChange(e.target.value);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentConfig.supportedDirections.map(dir => (
                <option key={dir} value={dir}>
                  {dir === 'TB' ? '⬇️ 纵向' : 
                   dir === 'LR' ? '➡️ 横向' : 
                   dir === 'BT' ? '⬆️ 底向上' :
                   dir === 'RL' ? '⬅️ 右向左' :
                   dir === 'radial' ? '🌟 放射状' :
                   dir === 'force' ? '🔗 力导向' : dir}
                </option>
              ))}
            </select>
          )}
          
          <span style={{ 
            fontSize: '16px', 
            color: 'var(--text-secondary)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* 展开的类型选择列表 */}
      {isExpanded && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          maxHeight: '300px',
          overflowY: 'auto',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '8px'
          }}>
            {Object.keys(CHART_TYPES).map(type => {
              const config = CHART_TYPES[type];
              const isSelected = type === selectedType;
              
              return (
                <div
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  style={{
                    padding: '12px',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-secondary)'}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 
                      (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)') : 
                      'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      const element = e.currentTarget;
                      element.style.backgroundColor = 'var(--bg-tertiary)';
                      element.style.borderColor = 'var(--border-primary)';
                      // 清除子元素的背景色样式
                      const childDivs = element.querySelectorAll('div');
                      childDivs.forEach(child => {
                        child.style.backgroundColor = 'transparent';
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      const element = e.currentTarget;
                      element.style.backgroundColor = 'var(--bg-secondary)';
                      element.style.borderColor = 'var(--border-secondary)';
                      // 恢复子元素的背景色样式
                      const childDivs = element.querySelectorAll('div');
                      childDivs.forEach(child => {
                        child.style.backgroundColor = '';
                      });
                    }
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{config.icon}</span>
                  <div style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      marginBottom: '2px',
                      backgroundColor: 'transparent'
                    }}>
                      {config.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      backgroundColor: 'transparent'
                    }}>
                      {config.description}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      gap: '8px',
                      backgroundColor: 'transparent'
                    }}>
                      <span>🎨 {config.renderer}</span>
                      <span>📐 {config.supportedDirections.join(', ')}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ 
                      color: 'var(--accent-primary)', 
                      fontSize: '16px' 
                    }}>
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 快速操作提示 */}
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--success)'
          }}>
            💡 <strong>提示：</strong>选择图表类型后，系统会自动检测代码并应用最佳渲染策略
          </div>
        </div>
      )}
      
      {/* CSS动画 */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}