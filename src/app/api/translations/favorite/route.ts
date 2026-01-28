import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Toggle favorite status
export async function POST(req: NextRequest) {
  try {
    const { sourceText, targetText, sourceLang, targetLang } = await req.json();

    if (!sourceText || !targetText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find existing translation
    const existingTranslation = await db.translation.findFirst({
      where: {
        sourceText,
        targetText,
        sourceLang,
        targetLang
      }
    });

    if (existingTranslation) {
      // Toggle favorite
      const updated = await db.translation.update({
        where: { id: existingTranslation.id },
        data: { favorited: !existingTranslation.favorited }
      });

      return NextResponse.json({
        success: true,
        favorited: updated.favorited
      });
    } else {
      // Create new favorited translation
      const translation = await db.translation.create({
        data: {
          sourceText,
          targetText,
          sourceLang: sourceLang || 'en',
          targetLang: targetLang || 'en',
          modality: 'text',
          favorited: true
        }
      });

      return NextResponse.json({
        success: true,
        favorited: true,
        translation
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      {
        error: 'Failed to toggle favorite',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
