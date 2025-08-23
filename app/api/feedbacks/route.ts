import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { FeedbackCategory, FeedbackPriority, FeedbackSentiment } from '@prisma/client';

const createFeedbackSchema = z.object({
  content: z.string().min(1, 'Feedback content is required.').max(1000, 'Content must be less than 1000 characters.'),
  category: z.nativeEnum(FeedbackCategory).default(FeedbackCategory.GENERAL_INQUIRY).optional(),
  sentiment: z.nativeEnum(FeedbackSentiment).default(FeedbackSentiment.NEUTRAL).optional(),
  priority: z.nativeEnum(FeedbackPriority).default(FeedbackPriority.LOW).optional(),
});

/**
 * Handles GET requests to fetch all feedbacks.
 */
export async function GET(req: NextRequest) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error('[FEEDBACKS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new feedback entry.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid input provided.',
          details: validation.error.flatten().fieldErrors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { content, category, sentiment, priority } = validation.data;

    const newFeedback = await prisma.feedback.create({
      data: {
        content,
        category,
        sentiment,
        priority,
      },
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('[FEEDBACKS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}