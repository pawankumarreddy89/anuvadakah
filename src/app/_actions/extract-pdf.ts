'use server';

export async function extractPDF(formData: FormData) {
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

    // Dynamically import pdf-parse at runtime to avoid build-time issues
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
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
