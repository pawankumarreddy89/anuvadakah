'use server';

/**
 * Production-safe PDF extraction
 * Receives pdf function as parameter to avoid internal import issues
 */
export async function extractPDF(formData: FormData, pdf: any) {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Only PDF files are supported',
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 10MB limit',
      };
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('PDF extraction: File size:', bytes.length, 'bytes');

    // Extract text using pdf function passed as parameter
    const data = await pdf(buffer);
    const extractedText = data.text.trim();

    console.log('PDF extraction: Extracted', extractedText.length, 'characters from', data.numpages, 'pages');

    if (!extractedText) {
      return {
        success: false,
        error: 'No text could be extracted from PDF',
      };
    }

    return {
      success: true,
      text: extractedText,
      pageCount: data.numpages,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      error: 'Failed to extract text from PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
