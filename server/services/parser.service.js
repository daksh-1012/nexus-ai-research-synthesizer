import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts raw textual content from uploaded file buffer
 * @param {Buffer} buffer - Multer file buffer
 * @param {string} mimeType - File mime type
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} Cleaned raw text
 */
export async function parseDocumentText(buffer, mimeType, originalName) {
  const isPdf = mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    try {
      const data = await pdf(buffer);
      const text = data.text ? data.text.trim() : '';
      if (!text) {
        throw new Error('Extracted PDF text is empty. The document may be scanned or image-only.');
      }
      return text;
    } catch (err) {
      console.warn('[PDF Parser] Fallback or error in PDF parse:', err.message);
      // Attempt UTF-8 string decoding if fallback
      const fallbackText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      if (fallbackText && fallbackText.length > 50) {
        return fallbackText;
      }
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }

  // Text/plain or markdown
  const text = buffer.toString('utf-8').trim();
  if (!text) {
    throw new Error('The uploaded text file is empty.');
  }
  return text;
}
