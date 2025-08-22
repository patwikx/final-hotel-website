// app/api/reservations/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ReservationStatus, ReservationSource, PaymentStatus } from '@prisma/client';

const createReservationRoomSchema = z.object({
  roomTypeId: z.string().uuid(),
  nights: z.number().int().positive(),
  rate: z.number().positive(),
  subtotal: z.number().positive(),
});

const createReservationSchema = z.object({
  businessUnitId: z.string().uuid(),
  guestId: z.string().uuid(),
  source: z.nativeEnum(ReservationSource).optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  nights: z.number().int().positive(),
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative().optional(),
  infants: z.number().int().nonnegative().optional(),
  subtotal: z.number().nonnegative(),
  taxes: z.number().nonnegative().optional(),
  serviceFee: z.number().nonnegative().optional(),
  discounts: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  specialRequests: z.string().optional().nullable(),
  rooms: z.array(createReservationRoomSchema).min(1, "At least one room is required for a reservation."),
});

/**
 * Handles GET requests to fetch reservations with filtering.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId');
    // Add more filters as needed, e.g., status, date range
    
    if (!businessUnitId) {
      return new NextResponse('Business Unit ID is required', { status: 400 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { businessUnitId },
      orderBy: { checkInDate: 'desc' },
      include: { guest: true, rooms: { include: { roomType: true } } },
    });

    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error('[RESERVATIONS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles POST requests to create a new reservation.
 */
export async function POST(req: Request) {
  try {
    // TODO: Add auth check
    const body = await req.json();
    const validation = createReservationSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const { rooms, ...reservationData } = validation.data;
    const confirmationNumber = `${reservationData.businessUnitId.substring(0, 2).toUpperCase()}-${Date.now()}`;

    // This should be wrapped in a transaction to ensure data integrity
    const newReservation = await prisma.$transaction(async (tx) => {
      // TODO: Add a more robust availability check here before creating the reservation
      
      const createdReservation = await tx.reservation.create({
        data: {
          ...reservationData,
          confirmationNumber,
          rooms: {
            create: rooms,
          },
        },
        include: {
          rooms: true,
        },
      });

      return createdReservation;
    });

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('[RESERVATIONS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
