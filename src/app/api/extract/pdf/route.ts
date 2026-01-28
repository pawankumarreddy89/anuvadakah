import { NextRequest, NextResponse } from 'next/server';

/**
 * PDF Extraction API Route
 * Uses dynamic import to bypass Turbopack ESM default export issue
 * EXACT FIX: await import('pdf-parse') bypasses static analysis
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Dynamic import to bypass Turbopack's static analysis
    const pdfModule = await import('pdf-parse');
    const pdf = pdfModule.default || pdfModule;

    const result = await extractPDF(formData, pdf);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      pageCount: result.pageCount,
    });
  } catch (error) {
    console.error('PDF route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
