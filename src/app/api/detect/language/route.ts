import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Create language detection prompt
    const systemPrompt = `You are a language detection expert. Analyze the given text and determine the language.
    
    Respond ONLY with the 2-letter ISO 639-1 language code. Do not provide explanations or additional text.
    
    Common language codes:
    en - English
    hi - Hindi
    bn - Bengali
    ta - Tamil
    te - Telugu
    mr - Marathi
    gu - Gujarati
    kn - Kannada
    ml - Malayalam
    pa - Punjabi
    or - Odia
    as - Assamese
    ur - Urdu
    sd - Sindhi
    ne - Nepali
    ks - Kashmiri
    sa - Sanskrit
    mai - Maithili
    doi - Dogri
    san - Santali
    mni - Manipuri
    bho - Bodo
    zh - Chinese
    es - Spanish
    fr - French
    de - German
    ja - Japanese
    ko - Korean
    ru - Russian
    ar - Arabic`;

    const userPrompt = `Detect the language of this text:
    
    "${text.substring(0, 500)}"`;

    // Create ZAI instance and detect language
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      thinking: { type: 'disabled' }
    });

    let detectedCode = completion.choices[0]?.message?.content?.trim().toLowerCase() || '';
    
    // Extract just the language code (remove any extra text)
    detectedCode = detectedCode.match(/^[a-z]{2,3}/)?.[0] || detectedCode.split(/[\s\n-:]/)[0];
    
    // Map to our supported languages or default to English
    const supportedLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'sd', 'ne', 'ks', 'sa', 'mai', 'doi', 'san', 'mni', 'bho'];
    const languageCode = supportedLanguages.includes(detectedCode) ? detectedCode : 'en';

    return NextResponse.json({
      success: true,
      language: languageCode,
      confidence: 0.95 // LLM detection confidence
    });

  } catch (error) {
    console.error('Language detection API error:', error);
    return NextResponse.json(
      {
        error: 'Language detection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        language: 'en' // Default to English on error
      },
      { status: 500 }
    );
  }
}
