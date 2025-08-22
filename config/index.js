// config/index.js - 配置管理模块

/**
 * 从环境变量中安全地获取API密钥和其他配置
 * 确保敏感信息不会被意外暴露到客户端
 */

// 从环境变量获取火山引擎API密钥
export const VOLC_API_KEY = process.env.VOLC_API_KEY || process.env.ARK_API_KEY;

if (!VOLC_API_KEY && typeof window === 'undefined') {
  console.warn('Warning: VOLC_API_KEY not found in environment variables. Some features may not work.');
}

// 大模型配置
export const LLM_CONFIG = {
  model: process.env.DEFAULT_LLM_MODEL || 'doubao-seed-1-6-thinking-250715',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  temperature: 0.2,
  maxTokens: 4000,
};

// PDF处理配置
export const PDF_CONFIG = {
  maxPages: parseInt(process.env.MAX_PDF_PAGES || '100', 10),
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  chunkSize: 2000, // 文本分块大小（字符数）
  chunkOverlap: 200, // 分块重叠大小
  imageQuality: 80, // 图像质量
  imageDensity: 144, // 图像DPI
  imageWidth: 1024, // 图像宽度
};

// 缓存配置
export const CACHE_CONFIG = {
  enabled: process.env.CACHE_ENABLED === 'true',
  ttl: 3600, // 缓存时间（秒）
  maxSize: 100, // 最大缓存条目数
};

// 智能路由配置
export const ROUTING_CONFIG = {
  // 页面复杂度阈值
  complexityThresholds: {
    textDensity: 0.3, // 文本密度阈值
    imageCount: 2, // 图像数量阈值
    tableCount: 1, // 表格数量阈值
  },
  // 处理策略
  strategies: {
    simple: 'fast', // 简单页面使用快速解析
    complex: 'multimodal', // 复杂页面使用多模态解析
  },
};

// Map-Reduce配置
export const MAP_REDUCE_CONFIG = {
  maxChunksPerBatch: 5, // 每批处理的最大块数
  summaryLength: 500, // 摘要长度（字符数）
  enableParallel: true, // 是否启用并行处理
};

// 错误处理配置
export const ERROR_CONFIG = {
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
  enableFallback: true, // 是否启用降级机制
};

// 导出所有配置
export default {
  VOLC_API_KEY,
  LLM_CONFIG,
  PDF_CONFIG,
  CACHE_CONFIG,
  ROUTING_CONFIG,
  MAP_REDUCE_CONFIG,
  ERROR_CONFIG,
};