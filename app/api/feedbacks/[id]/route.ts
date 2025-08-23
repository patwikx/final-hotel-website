import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { FeedbackCategory, FeedbackStatus, FeedbackSentiment, FeedbackPriority } from '@prisma/client';

// Zod schema for validating the update request.
// All fields are optional since you might only update one field at a time.
const updateFeedbackSchema = z.object({
  content: z.string().min(1).optional(),
  category: z.nativeEnum(FeedbackCategory).optional(),
  sentiment: z.nativeEnum(FeedbackSentiment).optional(),
  priority: z.nativeEnum(FeedbackPriority).optional(),
  status: z.nativeEnum(FeedbackStatus).optional(),
});

/**
 * Handles GET requests for a single feedback entry.
 * URL: /api/feedbacks/[id]
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object to resolve the Promise
    const { id } = await params;
    const feedback = await prisma.feedback.findUnique({ where: { id } });
    
    if (!feedback) {
      return new NextResponse('Feedback not found', { status: 404 });
    }
    
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error('[FEEDBACKS_ID_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a feedback entry.
 * URL: /api/feedbacks/[id]
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object to resolve the Promise
    const { id } = await params;
    const body = await req.json();
    const validation = updateFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }),
        { status: 400 }
      );
    }
    
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: validation.data,
    });
    
    return NextResponse.json(updatedFeedback, { status: 200 });
  } catch (error) {
    console.error('[FEEDBACKS_ID_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a feedback entry.
 * URL: /api/feedbacks/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object to resolve the Promise
    const { id } = await params;
    await prisma.feedback.delete({ where: { id } });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[FEEDBACKS_ID_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
