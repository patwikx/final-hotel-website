// app/api/reservations/[id]/payments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  currency: z.string().optional(),
  providerRef: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Handles POST requests to record a new payment for a reservation.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Add auth check
    const reservationId = params.id;
    const body = await req.json();
    const validation = createPaymentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: validation.error.flatten().fieldErrors }), { status: 400 });
    }

    const newPayment = await prisma.payment.create({
      data: {
        ...validation.data,
        reservationId,
        status: PaymentStatus.PAID, // Assume payment is successful
        processedAt: new Date(),
      },
    });

    // Optionally, update the reservation's payment status here
    // This logic can get complex (e.g., partial vs. full payment)
    // For now, we'll just record the payment.

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('[PAYMENTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
