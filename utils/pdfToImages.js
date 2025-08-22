import { fromBuffer } from 'pdf2pic';

/**
 * Render selected PDF pages to base64 data URLs (PNG) for multimodal input.
 *
 * Note: This utility relies on native binaries (GraphicsMagick/ImageMagick) via gm (pdf2pic dependency).
 * On some serverless platforms this may be unavailable. Caller should catch and fallback when errors occur.
 *
 * @param {Buffer} buffer - PDF file buffer
 * @param {Object} options
 * @param {number[]} options.pages - 1-based page numbers to render
 * @param {number} [options.density=144] - Rendering density (DPI)
 * @param {number} [options.width=1024] - Target width in pixels (height auto)
 * @param {"png"|"jpeg"} [options.format='png'] - Output format
 * @param {number} [options.quality=80] - JPEG/PNG quality
 * @returns {Promise<string[]>} - Array of data URL strings
 */
export async function renderPdfPagesToDataUrls(buffer, {
  pages = [1],
  density = 144,
  width = 1024,
  format = 'png',
  quality = 80,
} = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('renderPdfPagesToDataUrls: buffer is required');
  if (!Array.isArray(pages) || pages.length === 0) return [];

  const convert = fromBuffer(buffer, {
    density,
    format,
    width,
    quality,
    // Avoid writing to disk; pdf2pic will process in-memory for base64
    savePath: '/tmp',
    saveFilename: 'page',
  });

  const results = [];
  for (const p of pages) {
    try {
      const out = await convert.convertToBase64(p);
      const base64 = out?.base64;
      if (base64) {
        const prefix = format === 'jpeg' ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';
        results.push(prefix + base64);
      }
    } catch (err) {
      // Skip page on error, continue rendering others
    }
  }
  return results;
}