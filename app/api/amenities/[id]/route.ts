// app/api/amenities/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateAmenitySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isChargeable: z.boolean().optional(),
  chargeAmount: z.number().nonnegative().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

/**
 * Handles GET requests for a single amenity.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const amenity = await prisma.amenity.findUnique({ where: { id: params.id } });
    if (!amenity) {
      return new NextResponse('Amenity not found', { status: 404 });
    }
    return NextResponse.json(amenity, { status: 200 });
  } catch (error) {
    console.error('[AMENITY_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an amenity.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = updateAmenitySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedAmenity = await prisma.amenity.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedAmenity, { status: 200 });
  } catch (error) {
    console.error('[AMENITY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete an amenity.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    await prisma.amenity.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[AMENITY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
