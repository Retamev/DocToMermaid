'use client';
import { createContext, useContext, useEffect, useState } from 'react';

/**
 * 主题上下文
 * 管理应用的白天/夜间模式状态
 */
const ThemeContext = createContext();

/**
 * 主题提供者组件
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // 从localStorage加载主题设置
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemTheme;
      
      setTheme(initialTheme);
      setMounted(true);
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      setTheme('light');
      setMounted(true);
    }
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 只有在没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 应用主题到DOM
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // 移除之前的主题类
    root.classList.remove('light', 'dark');
    // 添加当前主题类
    root.classList.add(theme);
    
    // 设置CSS变量
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-tertiary', '#94a3b8');
      root.style.setProperty('--border-primary', '#475569');
      root.style.setProperty('--border-secondary', '#64748b');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#1d4ed8');
      root.style.setProperty('--success', '#10b981');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-tertiary', '#64748b');
      root.style.setProperty('--border-primary', '#e2e8f0');
      root.style.setProperty('--border-secondary', '#cbd5e1');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#1d4ed8');
      root.style.setProperty('--success', '#10b981');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
    }
  }, [theme, mounted]);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // 设置特定主题
  const setSpecificTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    
    setTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // 重置为系统主题
  const resetToSystemTheme = () => {
    try {
      localStorage.removeItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    } catch (error) {
      console.warn('Failed to reset theme:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    resetToSystemTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 使用主题的Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * 主题切换按钮组件
 */
export function ThemeToggle({ className = '', size = 'medium' }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // 防止水合不匹配
  if (!mounted) {
    return (
      <div 
        className={className}
        style={{
          width: size === 'small' ? '32px' : size === 'large' ? '48px' : '40px',
          height: size === 'small' ? '32px' : size === 'large' ? '48px' : '40px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '50%',
          border: '1px solid var(--border-primary)',
        }}
      />
    );
  }

  const buttonSize = size === 'small' ? '32px' : size === 'large' ? '48px' : '40px';
  const iconSize = size === 'small' ? '16px' : size === 'large' ? '24px' : '20px';

  return (
    <button
      onClick={toggleTheme}
      className={className}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: '50%',
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: iconSize,
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 4px var(--shadow)',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--bg-tertiary)';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'var(--bg-secondary)';
        e.target.style.transform = 'scale(1)';
      }}
      title={theme === 'light' ? '切换到夜间模式' : '切换到白天模式'}
      aria-label={theme === 'light' ? '切换到夜间模式' : '切换到白天模式'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

/**
 * 主题选择器组件
 */
export function ThemeSelector({ className = '' }) {
  const { theme, setTheme, resetToSystemTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={className} style={{ width: '120px', height: '36px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }} />
    );
  }

  return (
    <div className={className} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={theme}
        onChange={(e) => {
          if (e.target.value === 'system') {
            resetToSystemTheme();
          } else {
            setTheme(e.target.value);
          }
        }}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        <option value="light">☀️ 白天模式</option>
        <option value="dark">🌙 夜间模式</option>
        <option value="system">🖥️ 跟随系统</option>
      </select>
    </div>
  );
}

export default ThemeContext;