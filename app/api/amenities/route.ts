// app/api/amenities/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAmenitySchema = z.object({
  businessUnitId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isChargeable: z.boolean().optional(),
  chargeAmount: z.number().nonnegative().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests to fetch all amenities for a business unit.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');

    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    const amenities = await prisma.amenity.findMany({
      where: { businessUnitId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(amenities, { status: 200 });
  } catch (error) {
    console.error('[AMENITIES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new amenity.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createAmenitySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newAmenity = await prisma.amenity.create({
      data: validation.data,
    });

    return NextResponse.json(newAmenity, { status: 201 });
  } catch (error) {
    console.error('[AMENITIES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
