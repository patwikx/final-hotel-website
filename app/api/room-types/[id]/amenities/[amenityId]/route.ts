// app/api/room-types/[id]/amenities/[amenityId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handles DELETE requests to unlink an amenity from a room type.
 */
export async function DELETE(req: Request, { params }: { params: { id: string; amenityId: string } }) {
  try {
    // TODO: Add auth check
    const { id: roomTypeId, amenityId } = params;

    await prisma.roomTypeAmenity.delete({
      where: {
        roomTypeId_amenityId: {
          roomTypeId,
          amenityId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[UNLINK_AMENITY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
