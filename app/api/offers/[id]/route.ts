import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { OfferType, OfferStatus } from '@prisma/client';

const updateOfferSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().min(1).optional(),
  type: z.nativeEnum(OfferType).optional(),
  offerPrice: z.number().nonnegative().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  subtitle: z.string().optional().nullable(),
  shortDesc: z.string().optional().nullable(),
  status: z.nativeEnum(OfferStatus).optional(),
  featuredImage: z.string().url().optional().nullable(),
  originalPrice: z.number().nonnegative().optional().nullable(),
  currency: z.string().optional(),
  bookingDeadline: z.string().datetime().optional().nullable(),
  minNights: z.number().int().positive().optional(),
  promoCode: z.string().optional().nullable(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  termsConditions: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests for a single special offer.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const offer = await prisma.specialOffer.findUnique({ where: { id } });
        if (!offer) {
            return new NextResponse('Offer not found', { status: 404 });
        }
        return NextResponse.json(offer, { status: 200 });
    } catch (error) {
        console.error('[OFFER_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

/**
 * Handles PATCH requests to update a special offer.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id } = await params;
    const body = await req.json();
    const validation = updateOfferSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedOffer = await prisma.specialOffer.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedOffer, { status: 200 });
  } catch (error) {
    console.error('[OFFER_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a special offer.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // TODO: Add auth check
        const { id } = await params;
        await prisma.specialOffer.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[OFFER_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}