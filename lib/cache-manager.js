// lib/cache-manager.js - 缓存管理器
// 缓存耗时操作的结果，提高系统性能

import { CACHE_CONFIG } from '../config/index.js';
import crypto from 'crypto';

/**
 * 内存缓存实现
 */
class MemoryCache {
  constructor(maxSize = 100, ttl = 3600) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl * 1000; // 转换为毫秒
  }

  /**
   * 生成缓存键
   */
  generateKey(data) {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  /**
   * 设置缓存
   */
  set(key, value, customTtl = null) {
    const ttl = customTtl ? customTtl * 1000 : this.ttl;
    const expireTime = Date.now() + ttl;
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expireTime,
      createdAt: Date.now(),
    });
  }

  /**
   * 获取缓存
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 删除缓存
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireTime) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    return expiredKeys.length;
  }
}

/**
 * 缓存管理器
 * 提供统一的缓存接口和管理功能
 */
export class CacheManager {
  constructor(config = CACHE_CONFIG) {
    this.config = config;
    this.enabled = config.enabled;
    
    if (this.enabled) {
      this.cache = new MemoryCache(config.maxSize, config.ttl);
      this.hitCount = 0;
      this.missCount = 0;
      
      // 定期清理过期缓存
      this.cleanupInterval = setInterval(() => {
        this.cache.cleanup();
      }, 300000); // 每5分钟清理一次
    }
  }

  /**
   * 缓存PDF解析结果
   */
  async cachePdfParsing(pdfBuffer, parseOptions, parseFunction) {
    if (!this.enabled) {
      return await parseFunction();
    }

    const cacheKey = this.generatePdfCacheKey(pdfBuffer, parseOptions);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      this.hitCount++;
      console.log('Cache hit for PDF parsing');
      return cached;
    }

    this.missCount++;
    console.log('Cache miss for PDF parsing');
    
    const result = await parseFunction();
    this.cache.set(cacheKey, result, 7200); // PDF解析结果缓存2小时
    
    return result;
  }

  /**
   * 缓存图像渲染结果
   */
  async cacheImageRendering(pdfBuffer, pageNumbers, renderOptions, renderFunction) {
    if (!this.enabled) {
      return await renderFunction();
    }

    const cacheKey = this.generateImageCacheKey(pdfBuffer, pageNumbers, renderOptions);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      this.hitCount++;
      console.log('Cache hit for image rendering');
      return cached;
    }

    this.missCount++;
    console.log('Cache miss for image rendering');
    
    const result = await renderFunction();
    this.cache.set(cacheKey, result, 3600); // 图像渲染结果缓存1小时
    
    return result;
  }

  /**
   * 缓存LLM调用结果
   */
  async cacheLLMCall(prompt, model, options, llmFunction) {
    if (!this.enabled) {
      return await llmFunction();
    }

    const cacheKey = this.generateLLMCacheKey(prompt, model, options);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      this.hitCount++;
      console.log('Cache hit for LLM call');
      return cached;
    }

    this.missCount++;
    console.log('Cache miss for LLM call');
    
    const result = await llmFunction();
    this.cache.set(cacheKey, result, 1800); // LLM结果缓存30分钟
    
    return result;
  }

  /**
   * 缓存复杂度分析结果
   */
  cacheComplexityAnalysis(pageContent, analysisFunction) {
    if (!this.enabled) {
      return analysisFunction();
    }

    const cacheKey = this.generateComplexityCacheKey(pageContent);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      this.hitCount++;
      return cached;
    }

    this.missCount++;
    const result = analysisFunction();
    this.cache.set(cacheKey, result, 3600); // 复杂度分析结果缓存1小时
    
    return result;
  }

  /**
   * 生成PDF缓存键
   */
  generatePdfCacheKey(pdfBuffer, options) {
    const pdfHash = crypto.createHash('md5').update(pdfBuffer).digest('hex');
    const optionsHash = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex');
    return `pdf_${pdfHash}_${optionsHash}`;
  }

  /**
   * 生成图像缓存键
   */
  generateImageCacheKey(pdfBuffer, pageNumbers, options) {
    const pdfHash = crypto.createHash('md5').update(pdfBuffer).digest('hex');
    const pagesHash = crypto.createHash('md5').update(JSON.stringify(pageNumbers)).digest('hex');
    const optionsHash = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex');
    return `img_${pdfHash}_${pagesHash}_${optionsHash}`;
  }

  /**
   * 生成LLM缓存键
   */
  generateLLMCacheKey(prompt, model, options) {
    const data = { prompt, model, options };
    return `llm_${this.cache.generateKey(data)}`;
  }

  /**
   * 生成复杂度分析缓存键
   */
  generateComplexityCacheKey(content) {
    const contentHash = crypto.createHash('md5').update(content).digest('hex');
    return `complexity_${contentHash}`;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    if (!this.enabled) {
      return { enabled: false };
    }

    const cacheStats = this.cache.getStats();
    return {
      enabled: true,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      ...cacheStats,
    };
  }

  /**
   * 清空所有缓存
   */
  clearAll() {
    if (this.enabled) {
      this.cache.clear();
      this.hitCount = 0;
      this.missCount = 0;
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.enabled) {
      this.cache.clear();
    }
  }
}

// 创建全局缓存管理器实例
let globalCacheManager = null;

/**
 * 获取全局缓存管理器实例
 */
export function getCacheManager() {
  if (!globalCacheManager) {
    globalCacheManager = new CacheManager();
  }
  return globalCacheManager;
}

// 默认导出
export default CacheManager;