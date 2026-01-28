import { NextRequest, NextResponse } from 'next/server';
import { extractPDF } from '@/app/_actions/extract-pdf';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await extractPDF(formData);

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
