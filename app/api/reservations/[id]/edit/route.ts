import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ReservationStatus, PaymentStatus } from '@prisma/client';

const updateReservationSchema = z.object({
  status: z.nativeEnum(ReservationStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  checkInDate: z.string().datetime().optional(),
  checkOutDate: z.string().datetime().optional(),
  nights: z.number().int().positive().optional(),
  adults: z.number().int().positive().optional(),
  children: z.number().int().nonnegative().optional(),
  infants: z.number().int().nonnegative().optional(),
  subtotal: z.number().nonnegative().optional(),
  taxes: z.number().nonnegative().optional(),
  serviceFee: z.number().nonnegative().optional(),
  discounts: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  specialRequests: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

/**
 * Handles PATCH requests to update a reservation.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check
    const { id } = await params;
    const body = await req.json();
    const validation = updateReservationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if reservation exists
    const existingReservation = await prisma.reservation.findUnique({
      where: { id }
    });

    if (!existingReservation) {
      return new NextResponse('Reservation not found', { status: 404 });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...validation.data,
        // Handle date conversions
        checkInDate: validation.data.checkInDate ? new Date(validation.data.checkInDate) : undefined,
        checkOutDate: validation.data.checkOutDate ? new Date(validation.data.checkOutDate) : undefined,
      },
    });

    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    console.error('[RESERVATION_EDIT_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}