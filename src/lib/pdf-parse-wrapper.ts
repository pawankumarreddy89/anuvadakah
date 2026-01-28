/**
 * PDF Parse Wrapper - Production Build Fix
 *
 * PROBLEM: Turbopack in Vercel production cannot resolve default export from pdf-parse ESM
 * ROOT CAUSE: pdf-parse's ESM build (dist/pdf-parse/esm/index.js) exports named exports only, no default
 * SOLUTION: Force resolution to CJS build which exports a default
 */

// Direct CJS import - bypasses Turbopack's ESM resolution
let pdfParse: any;

async function getPDFParse() {
  if (!pdfParse) {
    try {
      // Try CJS build first - this bypasses ESM export issues
      const module = await import('pdf-parse/dist/pdf-parse/cjs/index.js');
      // CJS module exports default, extract it
      pdfParse = module.default || module;
      console.log('PDF Parse Wrapper: Loaded from CJS build via index.js');
    } catch (cjsError) {
      console.warn('PDF Parse Wrapper: CJS index.js failed, trying index.cjs...', cjsError);
      try {
        // Fallback to direct .cjs file
        const module = await import('pdf-parse/dist/pdf-parse/cjs/index.cjs');
        pdfParse = module.default || module;
        console.log('PDF Parse Wrapper: Loaded from CJS build via index.cjs');
      } catch (cjsError2) {
        console.error('PDF Parse Wrapper: All CJS imports failed', cjsError2);
        throw new Error('Failed to load pdf-parse from CJS build');
      }
    }
  }
  return pdfParse;
}

/**
 * Parse PDF buffer and extract text
 * This is the production-safe wrapper around pdf-parse
 */
export async function parsePDF(buffer: Buffer): Promise<any> {
  const pdf = await getPDFParse();
  return await pdf(buffer);
}
