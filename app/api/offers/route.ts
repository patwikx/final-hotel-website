// app/api/offers/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { OfferType, OfferStatus } from '@prisma/client';

const createOfferSchema = z.object({
  businessUnitId: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
  type: z.nativeEnum(OfferType),
  offerPrice: z.number().nonnegative(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
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
 * Handles GET requests to fetch all special offers for a business unit.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');

    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    const offers = await prisma.specialOffer.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    console.error('[OFFERS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new special offer.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createOfferSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }
    
    const { businessUnitId, slug, ...data } = validation.data;

    const existingOffer = await prisma.specialOffer.findUnique({
        where: { businessUnitId_slug: { businessUnitId, slug } }
    });

    if (existingOffer) {
        return new NextResponse('An offer with this slug already exists for this property.', { status: 409 });
    }

    const newOffer = await prisma.specialOffer.create({
      data: { ...data, businessUnitId, slug },
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    console.error('[OFFERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
