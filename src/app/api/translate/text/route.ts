import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: NextRequest) {
  try {
    const { sourceText, sourceLang, targetLang } = await req.json();

    if (!sourceText || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceText, sourceLang, targetLang' },
        { status: 400 }
      );
    }

    // Create translation prompt
    const systemPrompt = `You are a professional translator specializing in Indian languages. 
    Translate the given text accurately while preserving:
    - Cultural context and nuances
    - Honorifics and formal language
    - Idioms and regional expressions
    - The intended meaning and tone
    
    Respond ONLY with the translation, no explanations or additional text.`;

    const userPrompt = `Translate the following ${sourceLang} text to ${targetLang}:
    
    "${sourceText}"`;

    // Create ZAI instance and translate
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

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('Empty translation response');
    }

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLang,
      targetLang
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      {
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
