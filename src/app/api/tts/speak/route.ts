import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0, volume = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate text length (TTS API constraint: max 1024 characters)
    if (text.length > 1024) {
      return NextResponse.json(
        { error: 'Text input exceeds maximum length of 1024 characters' },
        { status: 400 }
      );
    }

    // Validate speed (must be between 0.5 and 2.0)
    if (speed < 0.5 || speed > 2.0) {
      return NextResponse.json(
        { error: 'Speed must be between 0.5 and 2.0' },
        { status: 400 }
      );
    }

    // Validate volume (must be greater than 0 and up to 10)
    if (volume <= 0 || volume > 10) {
      return NextResponse.json(
        { error: 'Volume must be greater than 0 and up to 10' },
        { status: 400 }
      );
    }

    // Create ZAI instance and generate TTS
    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice,
      speed: speed,
      volume: volume,
      response_format: 'wav',
      stream: false
    });

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Return audio as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      {
        error: 'Text-to-speech failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
