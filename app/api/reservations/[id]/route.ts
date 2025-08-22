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
  totalAmount: z.number().nonnegative().optional(),
  specialRequests: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

/**
 * Handles GET requests for a single reservation.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { guest: true, rooms: { include: { roomType: true } }, payments: true },
    });
    if (!reservation) {
      return new NextResponse('Reservation not found', { status: 404 });
    }
    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    console.error('[RESERVATION_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    console.error('[RESERVATION_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a reservation.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Add auth check. In a real app, you might want to soft-delete or just cancel.
    const { id } = await params;
    await prisma.reservation.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[RESERVATION_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}