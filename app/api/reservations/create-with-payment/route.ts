import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymongo } from '@/lib/paymongo';
import { z } from 'zod';
import { CreateCheckoutSessionRequest, PayMongoResponse, CheckoutSessionAttributes } from '@/types/paymongo-types';

const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative(),
  totalAmount: z.number().positive(),
  nights: z.number().int().positive(),
  subtotal: z.number().positive(),
  taxes: z.number().nonnegative(),
  serviceFee: z.number().nonnegative(),
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
});

type BookingRequest = z.infer<typeof bookingSchema>;

interface CreateReservationResponse {
  reservationId: string;
  checkoutUrl: string;
  paymentSessionId: string;
}

interface CreateReservationError {
  error: string;
  details?: string;
}

const generateConfirmationNumber = (): string => {
  const prefix = "RES";
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
};

export async function POST(req: NextRequest): Promise<NextResponse<CreateReservationResponse | CreateReservationError>> {
  try {
    const body: unknown = await req.json();
    const validatedData: BookingRequest = bookingSchema.parse(body);

    // Create reservation first
    const reservation = await prisma.$transaction(async (tx) => {
      let guest = await tx.guest.findUnique({
        where: { 
          businessUnitId_email: {
            businessUnitId: validatedData.businessUnitId,
            email: validatedData.email,
          }
        },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            businessUnitId: validatedData.businessUnitId,
          },
        });
      }

      const newReservation = await tx.reservation.create({
        data: {
          guestId: guest.id,
          businessUnitId: validatedData.businessUnitId,
          checkInDate: validatedData.checkInDate,
          checkOutDate: validatedData.checkOutDate,
          adults: validatedData.adults,
          children: validatedData.children,
          totalAmount: validatedData.totalAmount,
          nights: validatedData.nights,
          subtotal: validatedData.subtotal,
          taxes: validatedData.taxes,
          serviceFee: validatedData.serviceFee,
          confirmationNumber: generateConfirmationNumber(),
          paymentStatus: 'PENDING',
          status: 'PENDING',
          source: 'WEBSITE',
          rooms: {
            create: [{
              roomTypeId: validatedData.roomTypeId,
              nights: validatedData.nights,
              rate: validatedData.subtotal / validatedData.nights,
              subtotal: validatedData.subtotal,
            }]
          }
        },
      });

      return newReservation;
    });

    // Create PayMongo checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // PayMongo amount should be in centavos (multiply by 100)
    const amountInCentavos = Math.round(validatedData.totalAmount * 100);
    
    const checkoutSessionRequest: CreateCheckoutSessionRequest = {
      send_email_receipt: true,
      show_description: true,
      show_line_items: true,
      cancel_url: `${baseUrl}/booking-cancelled?reservation=${reservation.id}`,
      success_url: `${baseUrl}/booking-success?reservation=${reservation.id}`,
      line_items: [
        {
          currency: 'PHP',
          amount: amountInCentavos,
          description: `Hotel Booking - ${validatedData.nights} night${validatedData.nights > 1 ? 's' : ''}`,
          name: 'Hotel Room Reservation',
          quantity: 1,
        }
      ],
      payment_method_types: [
        'card',
        'paymaya',
        'gcash',
        'grab_pay',
        'billease',
        'dob',
        'dob_ubp',
        'brankas_bdo',
        'brankas_landbank',
        'brankas_metrobank'
      ],
      customer_email: validatedData.email,
      billing: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        phone: validatedData.phone,
      },
      description: `Reservation ${reservation.confirmationNumber} - ${validatedData.nights} nights`,
      reference_number: reservation.confirmationNumber,
      metadata: {
        reservation_id: reservation.id,
        confirmation_number: reservation.confirmationNumber,
        guest_name: `${validatedData.firstName} ${validatedData.lastName}`,
        check_in: validatedData.checkInDate,
        check_out: validatedData.checkOutDate,
        adults: validatedData.adults.toString(),
        children: validatedData.children.toString(),
      }
    };

    const checkoutSession: PayMongoResponse<CheckoutSessionAttributes> = await paymongo.createCheckoutSession(checkoutSessionRequest);

    // Update reservation with PayMongo session ID
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { 
        paymentIntentId: checkoutSession.data.id,
        paymentProvider: 'PAYMONGO'
      }
    });

    const response: CreateReservationResponse = {
      reservationId: reservation.id,
      checkoutUrl: checkoutSession.data.attributes.checkout_url,
      paymentSessionId: checkoutSession.data.id
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating reservation with PayMongo:', error);
    
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      
      return NextResponse.json({
        error: 'Validation failed',
        details: `Invalid data: ${validationErrors.map(e => e.message).join(', ')}`
      }, { status: 400 });
    }
    
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Failed to create reservation',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: 'Failed to create reservation',
      details: 'Unknown error occurred'
    }, { status: 500 });
  }
}