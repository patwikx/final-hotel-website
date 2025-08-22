// app/api/reservations/[id]/check-in/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReservationStatus, RoomStatus } from '@prisma/client';

/**
 * Handles POST requests to check-in a guest for a specific reservation.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const reservationId = params.id;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { rooms: true },
    });

    if (!reservation) {
      return new NextResponse('Reservation not found', { status: 404 });
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      return new NextResponse(`Reservation cannot be checked in. Status is: ${reservation.status}`, { status: 400 });
    }

    // Use a transaction to ensure all updates succeed or fail together
    const stay = await prisma.$transaction(async (tx) => {
      // 1. Create the Stay record
      const newStay = await tx.stay.create({
        data: {
          reservationId: reservation.id,
          guestId: reservation.guestId,
          actualCheckIn: new Date(),
        },
      });

      // 2. Update the Reservation status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CHECKED_IN },
      });

      // 3. Update the status of all associated rooms to OCCUPIED
      const roomIds = reservation.rooms.map(r => r.roomId).filter((id): id is string => id !== null);
      
      if (roomIds.length > 0) {
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: RoomStatus.OCCUPIED },
        });
      }

      return newStay;
    });

    return NextResponse.json(stay, { status: 201 });
  } catch (error) {
    console.error('[RESERVATION_CHECK_IN_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
