import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handles DELETE requests to unlink an amenity from a room type.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; amenityId: string }> }) {
  try {
    // TODO: Add auth check
    const { id: roomTypeId, amenityId } = await params;

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
