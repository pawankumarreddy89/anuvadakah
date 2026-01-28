import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // ============================================================
  // 🚨 PHASE 1 DIAGNOSTIC: ENTRY POINT
  // ============================================================
  console.log('\n=== PDF EXTRACTION ROUTE HANDLER INVOKED ===');
  console.log('[DIAG-1] Timestamp:', new Date().toISOString());
  console.log('[DIAG-1] Content-Type:', req.headers.get('content-type'));
  
  try {
    console.log('[DIAG-2] About to parse FormData...');
    const formData = await req.formData();

    console.log('[DIAG-3] FormData entries:', Array.from(formData.keys()));
    console.log('[DIAG-3] Has file entry:', formData.has('file'));

    // ============================================================
    // 🚨 PHASE 2 DIAGNOSTIC: FILE EXTRACTION
    // ============================================================
    console.log('\n--- PHASE 2: FILE EXTRACTION ---');

    const file = formData.get('file') as File;

    console.log('[DIAG-4] File object:', {
      exists: !!file,
      type: file?.type,
      name: file?.name,
      size: file?.size
    });

    if (!file) {
      console.error('[ERROR-1] No file provided in FormData');
      return NextResponse.json(
        { error: 'No file provided', diagnostic: 'missing-file' },
        { status: 400 }
      );
    }

    console.log('[DIAG-5] File type:', file.type);
    console.log('[DIAG-5] File name:', file.name);
    console.log('[DIAG-5] File size:', file.size, 'bytes');

    // ============================================================
    // 🚨 PHASE 3 DIAGNOSTIC: BUFFER CONVERSION
    // ============================================================
    console.log('\n--- PHASE 3: BUFFER CONVERSION ---');

    console.log('[DIAG-6] Starting buffer conversion...');
    const bytes = await file.arrayBuffer();
    console.log('[DIAG-6] ArrayBuffer byteLength:', bytes.byteLength);

    if (!bytes || bytes.byteLength === 0) {
      console.error('[ERROR-2] ArrayBuffer is empty or null');
      return NextResponse.json(
        { error: 'File buffer is empty', diagnostic: 'empty-buffer' },
        { status: 400 }
      );
    }

    console.log('[DIAG-6] Converting ArrayBuffer to Buffer...');
    const buffer = Buffer.from(bytes);
    console.log('[DIAG-6] Buffer byteLength:', buffer.length);
    console.log('[DIAG-6] Buffer first 20 bytes (hex):', buffer.slice(0, 20).toString('hex'));

    // ============================================================
    // 🚨 PHASE 4 DIAGNOSTIC: PDF LIBRARY IMPORT
    // ============================================================
    console.log('\n--- PHASE 4: PDF LIBRARY DYNAMIC IMPORT ---');

    console.log('[DIAG-7] Starting dynamic import of pdf-parse...');

    // ============================================================
    // 🚨 PHASE 5 DIAGNOSTIC: MODULE RESOLUTION
    // ============================================================
    console.log('\n--- PHASE 5: MODULE RESOLUTION ---');

    try {
      const pdfModule = await import('pdf-parse');
      console.log('[DIAG-8] pdfModule loaded:', {
        typeof: typeof pdfModule,
        hasDefault: 'default' in pdfModule,
        hasPDFParse: 'PDFParse' in pdfModule,
        keys: Object.keys(pdfModule).slice(0, 10)
      });

      // 2. Safely extract main function (default or named)
      const pdfParse = pdfModule.default || pdfModule;
      console.log('[DIAG-9] pdfParse extracted:', {
        typeof: typeof pdfParse,
        isFunction: typeof pdfParse === 'function'
      });

      if (typeof pdfParse !== 'function') {
        console.error('[ERROR-3] pdfParse is not a function. Type:', typeof pdfParse);
        console.error('[ERROR-3] Available exports:', Object.keys(pdfModule));
        return NextResponse.json(
          {
            error: 'PDF library not loaded correctly',
            diagnostic: 'not-a-function',
            availableExports: Object.keys(pdfModule)
          },
          { status: 500 }
        );
      }

      console.log('[DIAG-10] pdfParse function type confirmed as function');

    } catch (importError) {
      console.error('[ERROR-4] Failed to import pdf-parse:', {
        name: importError.name,
        message: importError.message,
        stack: importError.stack
      });
      return NextResponse.json(
        {
          error: 'Failed to load PDF library',
          diagnostic: 'import-failure',
          importError: importError.message
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 🚨 PHASE 6 DIAGNOSTIC: PDF PARSING
    // ============================================================
    console.log('\n--- PHASE 6: PDF PARSING ---');

    console.log('[DIAG-11] About to call pdfParse with buffer...');
    console.log('[DIAG-11] Buffer length:', buffer.length);

    try {
      const data = await pdfParse(buffer);
      console.log('[DIAG-12] pdfParse returned:', {
        hasText: 'text' in data,
        textLength: data?.text?.length || 0,
        hasNumPages: 'numpages' in data,
        numPages: data?.numpages || 0
      });

      const extractedText = data.text?.trim() || '';

      console.log('[DIAG-13] Text extracted:', {
        length: extractedText.length,
        sample: extractedText.substring(0, Math.min(100, extractedText.length))
      });

      console.log('[DIAG-14] Page count:', data?.numpages || 'unknown');

      if (!extractedText) {
        console.error('[ERROR-5] No text extracted from PDF');
        return NextResponse.json(
          {
            error: 'No text could be extracted from PDF',
            diagnostic: 'no-text-extracted'
          },
          { status: 400 }
        );
      }

      console.log('[DIAG-15] PDF parsing successful, preparing response...');

    } catch (parseError) {
      console.error('[ERROR-6] PDF parsing failed:', {
        name: parseError.name,
        message: parseError.message,
        stack: parseError.stack
      });

      return NextResponse.json(
        {
          error: 'Failed to extract text from PDF',
          diagnostic: 'parse-failure',
          parseError: parseError.message
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 🚨 PHASE 7 DIAGNOSTIC: RESPONSE FORMATION
    // ============================================================
    console.log('\n--- PHASE 7: RESPONSE FORMATION ---');

    const responsePayload = {
      success: true,
      text: extractedText,
      pageCount: data?.numpages || 1,
      diagnostic: {
        textLength: extractedText.length,
        timestamp: new Date().toISOString(),
        phases: 'completed'
      }
    };

    console.log('[DIAG-16] Response payload prepared:', {
      success: responsePayload.success,
      textLength: responsePayload.text.length,
      pageCount: responsePayload.pageCount
    });

    console.log('[DIAG-17] Returning success response...');

    return NextResponse.json(responsePayload);

  } catch (handlerError) {
    console.error('[ERROR-7] Unhandled exception in route handler:', {
      name: handlerError.name,
      message: handlerError.message,
      stack: handlerError.stack
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        diagnostic: 'unhandled-exception',
        errorMessage: handlerError.message
      },
      { status: 500 }
    );
  }
}
