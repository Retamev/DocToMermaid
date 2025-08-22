// lib/map-reduce-processor.js - Map-Reduce处理模块
// 实现分层处理大文档的核心逻辑

import { MAP_REDUCE_CONFIG, LLM_CONFIG } from '../config/index.js';
import { aiGenerateMermaid } from '../utils/aiToMermaid.js';
import OpenAI from 'openai';

/**
 * 文档分块器
 * 将大文档智能分割成可处理的小块
 */
export class DocumentChunker {
  constructor(config = MAP_REDUCE_CONFIG) {
    this.config = config;
  }

  /**
   * 智能分块
   * @param {string} text - 文档文本
   * @param {Object} options - 分块选项
   * @returns {Array} 文档块数组
   */
  chunk(text, options = {}) {
    const {
      chunkSize = 2000,
      chunkOverlap = 200,
      preserveStructure = true,
    } = options;

    if (preserveStructure) {
      return this.semanticChunk(text, chunkSize, chunkOverlap);
    } else {
      return this.fixedSizeChunk(text, chunkSize, chunkOverlap);
    }
  }

  /**
   * 语义分块 - 保持段落和章节完整性
   */
  semanticChunk(text, chunkSize, chunkOverlap) {
    const chunks = [];
    const paragraphs = text.split(/\n\s*\n/);
    
    let currentChunk = '';
    let currentSize = 0;

    for (const paragraph of paragraphs) {
      const paragraphSize = paragraph.length;
      
      // 如果当前块加上新段落超过大小限制
      if (currentSize + paragraphSize > chunkSize && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          size: currentSize,
          type: 'semantic',
        });
        
        // 处理重叠
        if (chunkOverlap > 0) {
          const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
          currentChunk = overlapText + '\n\n' + paragraph;
          currentSize = overlapText.length + paragraphSize + 2;
        } else {
          currentChunk = paragraph;
          currentSize = paragraphSize;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentSize += paragraphSize + (currentChunk ? 2 : 0);
      }
    }

    // 添加最后一个块
    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        size: currentSize,
        type: 'semantic',
      });
    }

    return chunks;
  }

  /**
   * 固定大小分块
   */
  fixedSizeChunk(text, chunkSize, chunkOverlap) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const content = text.slice(start, end);
      
      chunks.push({
        content,
        size: content.length,
        type: 'fixed',
        start,
        end,
      });

      start = end - chunkOverlap;
    }

    return chunks;
  }

  /**
   * 获取重叠文本
   */
  getOverlapText(text, overlapSize) {
    if (text.length <= overlapSize) return text;
    
    // 尝试在句子边界处截断
    const candidate = text.slice(-overlapSize);
    const sentenceEnd = candidate.lastIndexOf('.');
    
    if (sentenceEnd > overlapSize * 0.5) {
      return candidate.slice(sentenceEnd + 1).trim();
    }
    
    return candidate;
  }
}

/**
 * Map-Reduce处理器
 * 实现分层文档处理逻辑
 */
export class MapReduceProcessor {
  constructor(config = MAP_REDUCE_CONFIG) {
    this.config = config;
    this.chunker = new DocumentChunker(config);
    this.client = new OpenAI({
      apiKey: process.env.VOLC_API_KEY || process.env.ARK_API_KEY,
      baseURL: LLM_CONFIG.baseURL,
    });
  }

  /**
   * 处理大文档
   * @param {string} text - 文档文本
   * @param {string} direction - Mermaid方向
   * @param {Object} options - 处理选项
   * @returns {Object} 处理结果
   */
  async processLargeDocument(text, direction = 'TB', options = {}) {
    const {
      chunkSize = 2000,
      chunkOverlap = 200,
      maxNodes = 60,
      enableParallel = this.config.enableParallel,
    } = options;

    try {
      // Step 1: 分块
      const chunks = this.chunker.chunk(text, { chunkSize, chunkOverlap });
      
      console.log(`Document chunked into ${chunks.length} pieces`);

      // Step 2: Map阶段 - 并行处理每个块
      const mapResults = enableParallel 
        ? await this.parallelMap(chunks, direction, maxNodes)
        : await this.sequentialMap(chunks, direction, maxNodes);

      // Step 3: Reduce阶段 - 合并结果
      const finalResult = await this.reduce(mapResults, direction, maxNodes);

      return {
        success: true,
        mermaid: finalResult,
        stats: {
          totalChunks: chunks.length,
          processedChunks: mapResults.length,
          processingTime: Date.now(),
        },
      };
    } catch (error) {
      console.error('Map-Reduce processing failed:', error);
      throw error;
    }
  }

  /**
   * 并行Map处理
   */
  async parallelMap(chunks, direction, maxNodes) {
    const batchSize = this.config.maxChunksPerBatch;
    const results = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchPromises = batch.map((chunk, index) => 
        this.processChunk(chunk, direction, Math.floor(maxNodes / chunks.length), i + index)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Chunk ${i + index} processing failed:`, result.reason);
          // 添加错误占位符
          results.push({
            chunkIndex: i + index,
            summary: `[处理失败: 块 ${i + index}]`,
            mermaid: null,
            error: result.reason.message,
          });
        }
      });
    }

    return results;
  }

  /**
   * 顺序Map处理
   */
  async sequentialMap(chunks, direction, maxNodes) {
    const results = [];
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        const result = await this.processChunk(
          chunks[i], 
          direction, 
          Math.floor(maxNodes / chunks.length), 
          i
        );
        results.push(result);
      } catch (error) {
        console.error(`Chunk ${i} processing failed:`, error);
        results.push({
          chunkIndex: i,
          summary: `[处理失败: 块 ${i}]`,
          mermaid: null,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * 处理单个文档块
   */
  async processChunk(chunk, direction, maxNodes, chunkIndex) {
    const systemPrompt = `你是文档分析专家。请分析以下文档片段，提取关键信息并生成简洁的摘要。

要求：
1. 摘要长度控制在${this.config.summaryLength}字符以内
2. 保留重要的结构信息和关键概念
3. 如果包含流程或步骤，请明确标出
4. 忽略页眉、页脚等无关信息`;

    const userPrompt = `文档片段 ${chunkIndex + 1}：\n\n${chunk.content}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: LLM_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: LLM_CONFIG.temperature,
        max_tokens: 1000,
      });

      const summary = completion.choices[0]?.message?.content || '';

      return {
        chunkIndex,
        summary,
        originalSize: chunk.size,
        summarySize: summary.length,
      };
    } catch (error) {
      throw new Error(`Failed to process chunk ${chunkIndex}: ${error.message}`);
    }
  }

  /**
   * Reduce阶段 - 合并所有摘要生成最终Mermaid
   */
  async reduce(mapResults, direction, maxNodes) {
    // 过滤出成功处理的结果
    const validResults = mapResults.filter(result => result.summary && !result.error);
    
    if (validResults.length === 0) {
      throw new Error('No valid chunks processed');
    }

    // 合并所有摘要
    const combinedSummary = validResults
      .map((result, index) => `## 部分 ${index + 1}\n${result.summary}`)
      .join('\n\n');

    // 使用现有的AI生成Mermaid
    try {
      const mermaidCode = await aiGenerateMermaid(combinedSummary, direction, maxNodes);
      return mermaidCode;
    } catch (error) {
      // 如果AI生成失败，生成一个基础的流程图
      return this.generateFallbackMermaid(validResults, direction);
    }
  }

  /**
   * 生成降级Mermaid图
   */
  generateFallbackMermaid(results, direction) {
    const nodes = results.map((result, index) => {
      const label = result.summary.slice(0, 50).replace(/[\n\r]/g, ' ') + '...';
      return `  ${String.fromCharCode(65 + index)}["${label}"]`;
    });

    const connections = results.slice(0, -1).map((_, index) => 
      `  ${String.fromCharCode(65 + index)} --> ${String.fromCharCode(65 + index + 1)}`
    );

    return `graph ${direction}\n${nodes.join('\n')}\n${connections.join('\n')}`;
  }
}

// 默认导出
export default MapReduceProcessor;