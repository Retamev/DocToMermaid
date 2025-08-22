// lib/intelligent-router.js - 智能路由模块
// 实现页面级智能分析，决定解析策略

import { ROUTING_CONFIG } from '../config/index.js';

/**
 * 页面复杂度分析器
 * 分析PDF页面的复杂程度，决定使用哪种解析策略
 */
export class PageComplexityAnalyzer {
  constructor(config = ROUTING_CONFIG) {
    this.config = config;
  }

  /**
   * 分析页面复杂度
   * @param {Object} pageInfo - 页面信息
   * @param {string} pageInfo.text - 页面文本内容
   * @param {number} pageInfo.imageCount - 图像数量
   * @param {number} pageInfo.tableCount - 表格数量
   * @param {number} pageInfo.pageArea - 页面面积
   * @returns {Object} 复杂度分析结果
   */
  analyzeComplexity(pageInfo) {
    const { text = '', imageCount = 0, tableCount = 0, pageArea = 1 } = pageInfo;
    
    // 计算文本密度
    const textDensity = text.length / pageArea;
    
    // 复杂度评分
    const complexity = {
      textDensity,
      imageCount,
      tableCount,
      score: 0,
      factors: [],
    };

    // 文本密度评分
    if (textDensity > this.config.complexityThresholds.textDensity) {
      complexity.score += 1;
      complexity.factors.push('high_text_density');
    }

    // 图像数量评分
    if (imageCount > this.config.complexityThresholds.imageCount) {
      complexity.score += 2;
      complexity.factors.push('multiple_images');
    }

    // 表格数量评分
    if (tableCount > this.config.complexityThresholds.tableCount) {
      complexity.score += 2;
      complexity.factors.push('multiple_tables');
    }

    // 特殊内容检测
    if (this.hasFormulas(text)) {
      complexity.score += 1;
      complexity.factors.push('mathematical_formulas');
    }

    if (this.hasComplexLayout(text)) {
      complexity.score += 1;
      complexity.factors.push('complex_layout');
    }

    return complexity;
  }

  /**
   * 检测是否包含数学公式
   */
  hasFormulas(text) {
    const formulaPatterns = [
      /\$[^$]+\$/g, // LaTeX inline math
      /\$\$[^$]+\$\$/g, // LaTeX display math
      /\\[a-zA-Z]+\{/g, // LaTeX commands
      /[∑∏∫∂∇±×÷≤≥≠≈∞]/g, // Mathematical symbols
    ];
    
    return formulaPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 检测是否有复杂布局
   */
  hasComplexLayout(text) {
    const layoutPatterns = [
      /\t{2,}/g, // Multiple tabs (columns)
      /\n\s*\n\s*\n/g, // Multiple line breaks (sections)
      /^\s*[•·▪▫◦‣⁃]\s+/gm, // Bullet points
      /^\s*\d+\.\s+/gm, // Numbered lists
    ];
    
    return layoutPatterns.some(pattern => pattern.test(text));
  }
}

/**
 * 智能路由器
 * 根据页面复杂度决定解析策略
 */
export class IntelligentRouter {
  constructor(config = ROUTING_CONFIG) {
    this.config = config;
    this.analyzer = new PageComplexityAnalyzer(config);
  }

  /**
   * 路由决策
   * @param {Object} pageInfo - 页面信息
   * @returns {string} 解析策略 ('fast' | 'multimodal')
   */
  route(pageInfo) {
    const complexity = this.analyzer.analyzeComplexity(pageInfo);
    
    // 根据复杂度评分决定策略
    if (complexity.score >= 2) {
      return {
        strategy: this.config.strategies.complex,
        complexity,
        reason: `High complexity (score: ${complexity.score}), factors: ${complexity.factors.join(', ')}`,
      };
    } else {
      return {
        strategy: this.config.strategies.simple,
        complexity,
        reason: `Low complexity (score: ${complexity.score}), using fast parsing`,
      };
    }
  }

  /**
   * 批量路由决策
   * @param {Array} pagesInfo - 多个页面信息
   * @returns {Array} 路由决策结果
   */
  routePages(pagesInfo) {
    return pagesInfo.map((pageInfo, index) => ({
      pageIndex: index,
      ...this.route(pageInfo),
    }));
  }

  /**
   * 获取处理统计信息
   * @param {Array} routingResults - 路由结果
   * @returns {Object} 统计信息
   */
  getProcessingStats(routingResults) {
    const stats = {
      totalPages: routingResults.length,
      fastPages: 0,
      multimodalPages: 0,
      complexityDistribution: {},
    };

    routingResults.forEach(result => {
      if (result.strategy === 'fast') {
        stats.fastPages++;
      } else {
        stats.multimodalPages++;
      }

      const score = result.complexity.score;
      stats.complexityDistribution[score] = (stats.complexityDistribution[score] || 0) + 1;
    });

    stats.fastRatio = stats.fastPages / stats.totalPages;
    stats.multimodalRatio = stats.multimodalPages / stats.totalPages;

    return stats;
  }
}

// 默认导出
export default IntelligentRouter;