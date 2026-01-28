import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: NextRequest) {
  try {
    const { audio } = await req.json();

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    // Create ZAI instance and transcribe audio
    const zai = await ZAI.create();

    const response = await zai.audio.asr.create({
      file_base64: audio
    });

    const transcription = response.text?.trim();

    if (!transcription) {
      throw new Error('Empty transcription result');
    }

    return NextResponse.json({
      success: true,
      text: transcription
    });

  } catch (error) {
    console.error('ASR API error:', error);
    return NextResponse.json(
      {
        error: 'Speech recognition failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
