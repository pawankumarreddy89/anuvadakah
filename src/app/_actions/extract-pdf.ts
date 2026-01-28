'use server';

import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs-dist to work with Next.js and avoid worker issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '';
pdfjsLib.GlobalWorkerOptions.workerPort = null;

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

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    console.log('PDF extraction: File size:', arrayBuffer.length, 'bytes');

    // Load PDF document without worker
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;

    console.log('PDF extraction: Loaded', pdf.numPages, 'pages');

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      fullText += pageText + '\n';
    }

    const extractedText = fullText.trim();

    console.log('PDF extraction: Extracted', extractedText.length, 'characters');

    if (!extractedText) {
      return {
        success: false,
        error: 'No text could be extracted from PDF',
      };
    }

    return {
      success: true,
      text: extractedText,
      pageCount: pdf.numPages,
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
