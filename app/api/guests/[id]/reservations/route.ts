import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handles GET requests to fetch all reservations for a specific guest.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: guestId } = await params;
    
    const reservations = await prisma.reservation.findMany({
      where: { guestId },
      orderBy: { createdAt: 'desc' },
      include: {
        businessUnit: {
          select: { displayName: true }
        },
        rooms: {
          include: {
            roomType: {
              select: { displayName: true }
            }
          }
        }
      }
    });

    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error('[GUEST_RESERVATIONS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}