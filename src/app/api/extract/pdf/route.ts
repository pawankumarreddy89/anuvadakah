import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('PDF extraction: Starting new clean implementation');
  
  try {
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
    const maxSize = 10 * 1024 * 1024; // 10MB
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

    // Import pdf-parse using dynamic import to avoid CommonJS issues
    const pdfParse = (await import('pdf-parse')).default;

    // Extract text from PDF
    const data = await pdfParse(buffer);
    const extractedText = data.text.trim();

    console.log('PDF extraction: Raw extracted text length:', extractedText.length);

    if (!extractedText || extractedText.length === 0) {
      console.error('PDF extraction: No text could be extracted');
      return NextResponse.json(
        { error: 'No text could be extracted from PDF. The document may be image-only, password-protected, or corrupted.' },
        { status: 400 }
      );
    }

    // Filter out common PDF garbage artifacts
    const cleanedText = extractedText
      // Remove control characters (except common ones)
      .replace(/[\x00-\x08]/g, '') // Basic Latin-1 Supplement, Block Elements
      // Remove extended ASCII artifacts
      .replace(/[\x80-\x9F]/g, '') // Latin Extended, Greek, Cyrillic
      // Replace multiple consecutive whitespace with single space
      .replace(/[ \t\r\n]+/g, ' ')
      // Remove common PDF encoding artifacts and special characters
      .replace(/[\u2000-\u200F]/g, '') // General Punctuation, Currency, Symbols
      .replace(/[\u2028-\u202F]/g, '') // General Punctuation
      .replace(/[\u2060-\u206F]/g, '') // Symbols
      .replace(/[\uFFF0-\uFFEF]/g, '') // Special characters
      .replace(/[\uFE10-\uFE1F\uFE30-\uFE4F]/g, '') // Specials, Symbols
      // Remove non-ASCII printable characters that aren't common text
      .replace(/[^\x20-\x7E\r\n\t.,!?;:'"()\-]+/g, '')
      .trim();

    console.log('PDF extraction: Final cleaned text length:', cleanedText.length);

    if (cleanedText.length === 0) {
      console.error('PDF extraction: Text became empty after cleaning');
      return NextResponse.json(
        { error: 'Could not extract readable text from PDF. The document may contain only images or be password-protected.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: cleanedText,
      pageCount: data.numpages,
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
