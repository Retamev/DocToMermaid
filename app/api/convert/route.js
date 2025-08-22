import pdfParse from 'pdf-parse';
import { textToMermaid } from '../../../utils/textToMermaid';
import { aiGenerateMermaid } from '../../../utils/aiToMermaid';
import { renderPdfPagesToDataUrls } from '../../../utils/pdfToImages';
import { aiGenerateMermaidVision } from '../../../utils/aiToMermaidVision';
import { IntelligentRouter } from '../../../lib/intelligent-router.js';
import { MapReduceProcessor } from '../../../lib/map-reduce-processor.js';
import { getCacheManager } from '../../../lib/cache-manager.js';
import { PDF_CONFIG } from '../../../config/index.js';

export const runtime = 'nodejs';

export async function POST(request) {
  const startTime = Date.now();
  const cacheManager = getCacheManager();
  const router = new IntelligentRouter();
  const mapReduceProcessor = new MapReduceProcessor();
  
  try {
    // 检查环境变量配置
    const hasApiKey = process.env.VOLC_API_KEY || process.env.ARK_API_KEY;
    if (!hasApiKey) {
      console.warn('警告: 未配置API密钥，将使用基础规则解析');
    }
    const formData = await request.formData();
    const file = formData.get('file');
    const direction = (formData.get('direction') || 'TB').toString().toUpperCase();
    const vision = String(formData.get('vision') || 'on');
    const enableMapReduce = String(formData.get('mapReduce') || 'auto'); // 'on' | 'off' | 'auto'

    if (!file || typeof file.arrayBuffer !== 'function') {
      return new Response(JSON.stringify({ error: '请上传 PDF 文件' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 检查文件大小
    const fileSizeMB = buffer.length / (1024 * 1024);
    if (fileSizeMB > PDF_CONFIG.maxFileSizeMB) {
      return new Response(JSON.stringify({ 
        error: `文件过大，最大支持 ${PDF_CONFIG.maxFileSizeMB}MB` 
      }), { status: 400 });
    }

    // 使用缓存的PDF解析
    const parseOptions = { vision, direction, enableMapReduce };
    const parseResult = await cacheManager.cachePdfParsing(buffer, parseOptions, async () => {
      const parsed = await pdfParse(buffer);
      return {
        text: parsed?.text || '',
        numpages: parsed?.numpages || 0,
        info: parsed?.info || {},
      };
    });

    const { text, numpages } = parseResult;
    
    // 检查页数限制
    if (numpages > PDF_CONFIG.maxPages) {
      return new Response(JSON.stringify({ 
        error: `PDF页数过多（${numpages}页），最大支持 ${PDF_CONFIG.maxPages} 页` 
      }), { status: 400 });
    }

    let mermaid = '';
    let usedAI = false;
    let usedVision = false;
    let usedMapReduce = false;
    let processingStrategy = 'unknown';
    let routingStats = null;

    // 决定处理策略
    const shouldUseMapReduce = enableMapReduce === 'on' || 
      (enableMapReduce === 'auto' && (text.length > 10000 || numpages > 20));

    if (!process.env.ARK_API_KEY && !process.env.VOLC_API_KEY) {
      // 无API Key，使用规则版本
      mermaid = textToMermaid(text, direction, { maxNodes: 60 });
      processingStrategy = 'rule-based';
    } else if (shouldUseMapReduce) {
      // 使用Map-Reduce处理大文档
      try {
        console.log(`Using Map-Reduce for large document (${text.length} chars, ${numpages} pages)`);
        const mapReduceResult = await mapReduceProcessor.processLargeDocument(text, direction, {
          chunkSize: PDF_CONFIG.chunkSize,
          chunkOverlap: PDF_CONFIG.chunkOverlap,
          maxNodes: 60,
        });
        
        mermaid = mapReduceResult.mermaid;
        usedAI = true;
        usedMapReduce = true;
        processingStrategy = 'map-reduce';
        routingStats = mapReduceResult.stats;
      } catch (e) {
        console.error('Map-Reduce failed, falling back to simple AI:', e);
        // 回退到简单AI处理
        mermaid = await aiGenerateMermaid(text.slice(0, 20000), direction, 60);
        usedAI = true;
        processingStrategy = 'ai-fallback';
      }
    } else {
      // 使用智能路由决定处理策略
      try {
        const pageInfo = {
          text,
          imageCount: 0, // 暂时设为0，后续可以通过PDF分析获取
          tableCount: (text.match(/\|.*\|/g) || []).length, // 简单的表格检测
          pageArea: numpages * 1000, // 估算页面面积
        };
        
        const routingDecision = router.route(pageInfo);
        processingStrategy = routingDecision.strategy;
        
        if (vision === 'on' && routingDecision.strategy === 'multimodal') {
          // 多模态处理
          const total = numpages;
          const maxPages = Math.min(total, 10); // 限制最多处理10页图像
          const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
          
          const images = await cacheManager.cacheImageRendering(
            buffer, pages, 
            { density: PDF_CONFIG.imageDensity, width: PDF_CONFIG.imageWidth, format: 'png', quality: PDF_CONFIG.imageQuality },
            async () => {
              try {
                return await renderPdfPagesToDataUrls(buffer, { 
                  pages, 
                  density: PDF_CONFIG.imageDensity, 
                  width: PDF_CONFIG.imageWidth, 
                  format: 'png', 
                  quality: PDF_CONFIG.imageQuality 
                });
              } catch (e) {
                console.warn('Image rendering failed:', e);
                return [];
              }
            }
          );
          
          if (images.length > 0) {
            mermaid = await cacheManager.cacheLLMCall(
              `${text}_${images.length}_images`, 'vision', { direction, maxNodes: 60 },
              async () => await aiGenerateMermaidVision({ text, images, direction, maxNodes: 60 })
            );
            usedAI = true;
            usedVision = true;
          } else {
            // 图像渲染失败，回退到文本AI
            mermaid = await cacheManager.cacheLLMCall(
              text, 'text', { direction, maxNodes: 60 },
              async () => await aiGenerateMermaid(text, direction, 60)
            );
            usedAI = true;
            usedVision = false;
          }
        } else {
          // 快速文本处理
          mermaid = await cacheManager.cacheLLMCall(
            text, 'text', { direction, maxNodes: 60 },
            async () => await aiGenerateMermaid(text, direction, 60)
          );
          usedAI = true;
          usedVision = false;
        }
        
        routingStats = {
          strategy: routingDecision.strategy,
          complexity: routingDecision.complexity,
          reason: routingDecision.reason,
        };
      } catch (e) {
        console.error('AI processing failed, falling back to rules:', e);
        mermaid = textToMermaid(text, direction, { maxNodes: 60 });
        usedAI = false;
        usedVision = false;
        processingStrategy = 'rule-fallback';
      }
    }

    const processingTime = Date.now() - startTime;
    const cacheStats = cacheManager.getStats();
    
    return new Response(
      JSON.stringify({
        mermaid,
        stats: {
          pages: numpages,
          words: (text.match(/\S+/g) || []).length,
          characters: text.length,
          fileSizeMB: Math.round(fileSizeMB * 100) / 100,
          processingTimeMs: processingTime,
          processingStrategy,
          usedAI,
          usedVision,
          usedMapReduce,
          routing: routingStats,
          cache: {
            hitRate: cacheStats.hitRate,
            enabled: cacheStats.enabled,
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('API错误:', err);
    
    // 确保错误响应格式正确
    const errorResponse = {
      error: '解析失败',
      detail: err?.message || String(err),
      timestamp: new Date().toISOString(),
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}