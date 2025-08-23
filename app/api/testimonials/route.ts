// app/api/testimonials/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTestimonialSchema = z.object({
  guestName: z.string().min(1),
  guestTitle: z.string().optional().nullable(),
  guestCountry: z.string().optional().nullable(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  source: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests to fetch all testimonials.
 */
export async function GET(req: Request) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error('[TESTIMONIALS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new testimonial.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createTestimonialSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newTestimonial = await prisma.testimonial.create({
      data: validation.data,
    });

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('[TESTIMONIALS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}