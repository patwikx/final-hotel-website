// app/api/reservations/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Reservation, Guest, BusinessUnit, RoomType } from '@prisma/client';

// Define a more specific type for the reservation with its relations
type ReservationWithDetails = Reservation & {
  guest: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  businessUnit: {
    name: string;
  } | null;
  rooms: {
    roomType: {
      name: string;
    } | null;
  }[];
};

interface ReservationStatusResponse {
  id: string;
  status: string;
  paymentStatus: string;
  paidAt: Date | null;
  cancelledAt: Date | null;
  guest: {
    firstName: string;
    lastName:string;
    email: string;
  } | null;
  businessUnit: {
    name: string;
  } | null;
  roomType: {
    name: string;
  } | null;
}

interface StatusError {
  error: string;
  details?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ReservationStatusResponse | StatusError>> {
  try {
    const reservationId = params.id;

    if (!reservationId) {
      return NextResponse.json({
        error: 'Reservation ID is required'
      }, { status: 400 });
    }

    // Find the reservation with related data, accessing roomType through the rooms relation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        businessUnit: {
          select: {
            name: true,
          }
        },
        // Correctly include roomType through the rooms -> roomType relation
        rooms: {
          select: {
            roomType: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    if (!reservation) {
      return NextResponse.json({
        error: 'Reservation not found'
      }, { status: 404 });
    }

    // Extract the first room type from the rooms array for the response
    const roomTypeInfo = reservation.rooms[0]?.roomType || null;

    return NextResponse.json({
      id: reservation.id,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      paidAt: reservation.paidAt,
      cancelledAt: reservation.cancelledAt,
      guest: reservation.guest,
      businessUnit: reservation.businessUnit,
      roomType: roomTypeInfo,
    });

  } catch (error) {
    console.error('Error fetching reservation status:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch reservation status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
