import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is an image
    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];

    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, WebP, BMP, TIFF) are supported' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create image data URL for Tesseract
    const base64 = buffer.toString('base64');
    const imageDataUrl = `data:${file.type};base64,${base64}`;

    // Perform OCR using Tesseract
    const result = await Tesseract.recognize(
      imageDataUrl,
      'eng+hin+ben+tam+tel+mar+guj+kan+mal+pan+ori+asm+urd', // Support multiple languages
      {
        logger: (m: any) => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    const extractedText = result.data.text.trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text could be extracted from image' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      confidence: result.data.confidence,
      words: (result.data as any).words?.length || 0,
    });

  } catch (error) {
    console.error('Image OCR error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
