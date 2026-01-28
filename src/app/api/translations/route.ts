import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all translations
export async function GET(req: NextRequest) {
  try {
    const translations = await db.translation.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      translations
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch translations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new translation
export async function POST(req: NextRequest) {
  try {
    const { sourceText, sourceLang, targetText, targetLang, modality = 'text' } = await req.json();

    if (!sourceText || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const translation = await db.translation.create({
      data: {
        sourceText,
        sourceLang,
        targetText: targetText || '',
        targetLang,
        modality,
        favorited: false
      }
    });

    return NextResponse.json({
      success: true,
      translation
    });
  } catch (error) {
    console.error('Error creating translation:', error);
    return NextResponse.json(
      {
        error: 'Failed to save translation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
