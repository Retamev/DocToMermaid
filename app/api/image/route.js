import { aiGenerateMermaidVision } from '../../../utils/aiToMermaidVision';

export const runtime = 'nodejs';

export async function POST(request) {
  const startTime = Date.now();
  try {
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body.imageDataUrl = formData.get('imageDataUrl');
      body.direction = (formData.get('direction') || 'TB').toString();
      body.chartType = (formData.get('chartType') || 'mermaid').toString();
    } else {
      return new Response(JSON.stringify({ error: '不支持的Content-Type' }), { status: 400 });
    }

    const imageDataUrl = (body.imageDataUrl || '').toString();
    const direction = (body.direction || 'TB').toString().toUpperCase();
    const chartType = (body.chartType || 'mermaid').toString();

    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: '缺少有效的图片数据' }), { status: 400 });
    }

    // 直接使用图片的DataURL作为多模态输入，文本为空字符串
    const mermaid = await aiGenerateMermaidVision({ text: '', images: [imageDataUrl], direction, maxNodes: 60, chartType });

    const processingTime = Date.now() - startTime;
    const approxSizeMB = Math.round((((imageDataUrl.length * 3) / 4) / (1024 * 1024)) * 100) / 100;

    return new Response(
      JSON.stringify({
        mermaid,
        stats: {
          source: 'image',
          fileSizeMB: approxSizeMB,
          processingTimeMs: processingTime,
          processingStrategy: 'image-vision',
          usedAI: true,
          usedVision: true,
          usedMapReduce: false
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Image API 错误:', err);
    const errorResponse = {
      error: '图片解析失败',
      detail: err?.message || String(err),
      timestamp: new Date().toISOString(),
    };
    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}