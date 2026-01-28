import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('PDF extraction: Starting with pdf-parse via dynamic import');

    // 1. Dynamically import module to bypass Turbopack static analysis
    const pdfModule = await import('pdf-parse');

    // 2. Safely extract main function (default or named)
    const pdfParse = pdfModule.default || pdfModule;

    // 3. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('PDF extraction: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      console.error('PDF extraction: Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('PDF extraction: File too large:', file.size);
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('PDF extraction: File size:', bytes.length, 'bytes');

    // 4. Extract text using pdfParse function
    const data = await pdfParse(buffer);
    const extractedText = data.text.trim();

    console.log('PDF extraction: Extracted', extractedText.length, 'characters from', data.numpages, 'pages');

    if (!extractedText) {
      console.error('PDF extraction: No text could be extracted');
      return NextResponse.json(
        { error: 'No text could be extracted from PDF' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      pageCount: data.numpages,
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
