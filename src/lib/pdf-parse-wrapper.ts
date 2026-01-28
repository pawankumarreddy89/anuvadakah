/**
 * PDF Parse Wrapper - Production Build Fix
 *
 * PROBLEM: Turbopack in Vercel production cannot resolve default export from pdf-parse ESM
 * ROOT CAUSE: pdf-parse's ESM build (dist/pdf-parse/esm/index.js) exports named exports only, no default
 * SOLUTION: Use named import { PDFParse } class instead of default
 */

// Import the PDFParse class directly from ESM build
// This bypasses the "default export not found" error
import { PDFParse } from 'pdf-parse';

/**
 * Parse PDF buffer and extract text
 * This uses the PDFParse class directly instead of relying on default export
 */
export async function parsePDF(buffer: Buffer): Promise<any> {
  try {
    // Create PDFParse instance with the buffer
    const parser = new PDFParse({
      data: buffer,
      verbosity: 0, // 0 = errors only
    });

    // Get the parsed data
    const data = await parser.getText();

    // Calculate page count from the data
    const numpages = data?.info?.Pages || 1;

    console.log('PDF extraction via PDFParse class:', {
      pages: numpages,
      textLength: data?.text?.length || 0,
      parserType: 'PDFParse class (ESM)'
    });

    return {
      text: data?.text || '',
      numpages,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);

    // Fallback: Try direct package import without subpath
    try {
      // Import the package directly - let Node's conditional exports resolve the right build
      const pdfModule = await import('pdf-parse');

      // Extract default if it exists, otherwise use the module directly
      const pdfParse = pdfModule.default || pdfModule;

      console.log('PDF extraction: Using dynamic import fallback');

      // Call the function or class
      if (typeof pdfParse === 'function') {
        return await pdfParse(buffer);
      } else if (pdfParse && typeof pdfParse.PDFParse === 'function') {
        const Parser = pdfParse.PDFParse;
        const parser = new Parser({ data: buffer, verbosity: 0 });
        const data = await parser.getText();
        return {
          text: data?.text || '',
          numpages: data?.info?.Pages || 1,
        };
      } else {
        throw new Error('Unable to find PDFParse function in imported module');
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : String(error)} (fallback failed)`);
    }
  }
}
