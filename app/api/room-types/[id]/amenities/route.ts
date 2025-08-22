// app/api/room-types/[id]/amenities/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const linkAmenitySchema = z.object({
  amenityId: z.string().uuid(),
});

/**
 * Handles POST requests to link an amenity to a room type.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const roomTypeId = params.id;
    const body = await req.json();
    const validation = linkAmenitySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { amenityId } = validation.data;

    const link = await prisma.roomTypeAmenity.create({
      data: {
        roomTypeId,
        amenityId,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('[LINK_AMENITY_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
