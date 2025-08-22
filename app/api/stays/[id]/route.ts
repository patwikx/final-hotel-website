import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReservationStatus, RoomStatus, HousekeepingStatus } from '@prisma/client';

/**
 * Handles POST requests to check-out a guest for a specific stay.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id: stayId } = await params;

    const stay = await prisma.stay.findUnique({
      where: { id: stayId },
      include: { reservation: { include: { rooms: true } } },
    });

    if (!stay) {
      return new NextResponse('Stay not found', { status: 404 });
    }

    if (stay.actualCheckOut) {
      return new NextResponse('Guest has already been checked out.', { status: 400 });
    }

    const updatedStay = await prisma.$transaction(async (tx) => {
      // 1. Update the Stay record
      const checkedOutStay = await tx.stay.update({
        where: { id: stayId },
        data: { actualCheckOut: new Date() },
      });

      // 2. Update the Reservation status
      await tx.reservation.update({
        where: { id: stay.reservationId },
        data: { status: ReservationStatus.CHECKED_OUT },
      });

      // 3. Update room statuses to DIRTY for housekeeping
      const roomIds = stay.reservation.rooms.map(r => r.roomId).filter((id): id is string => id !== null);
      
      if (roomIds.length > 0) {
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { 
            status: RoomStatus.AVAILABLE, // Or CLEANING, depending on hotel process
            housekeeping: HousekeepingStatus.DIRTY 
          },
        });
      }

      return checkedOutStay;
    });

    return NextResponse.json(updatedStay, { status: 200 });
  } catch (error) {
    console.error('[STAY_CHECK_OUT_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
