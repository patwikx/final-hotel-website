import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTestimonialSchema = z.object({
  guestName: z.string().min(1).optional(),
  guestTitle: z.string().optional().nullable(),
  guestCountry: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  source: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests for a single testimonial.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return new NextResponse('Testimonial not found', { status: 404 });
    }
    return NextResponse.json(testimonial, { status: 200 });
  } catch (error) {
    console.error('[TESTIMONIAL_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update a testimonial.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateTestimonialSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedTestimonial, { status: 200 });
  } catch (error) {
    console.error('[TESTIMONIAL_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a testimonial.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.testimonial.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TESTIMONIAL_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}