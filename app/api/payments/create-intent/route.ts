// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getReservationById } from '@/services/reservation-services';
import { createPaymentIntent } from '@/lib/paymongo';
import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    const reservation = await getReservationById(reservationId);

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Convert total amount to centavos for PayMongo
    const amountInCentavos = Math.round(Number(reservation.totalAmount) * 100);

    const paymentIntent = await createPaymentIntent(
      amountInCentavos,
      'PHP',
      `Payment for reservation ${reservation.confirmationNumber}`,
      { reservationId: reservation.id }
    );
    
    // Create a payment record in our database
    await prisma.payment.create({
        data: {
            reservationId: reservation.id,
            provider: 'paymongo',
            providerPaymentId: paymentIntent.id,
            clientKey: paymentIntent.attributes.client_key,
            amount: reservation.totalAmount,
            currency: 'PHP',
            status: 'PENDING',
            method: PaymentMethod.PAYMONGO, // Added missing 'method' field
        }
    });

    return NextResponse.json({ 
        clientKey: paymentIntent.attributes.client_key,
        paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error in create-intent handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
