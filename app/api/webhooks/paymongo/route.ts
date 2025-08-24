// Updated webhook handler with proper typing: /api/webhooks/paymongo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { 
  WebhookEvent, 
  CheckoutSessionWebhookData, 
  PaymentIntentWebhookData,
  isWebhookEvent,
  isCheckoutSessionEvent,
  isPaymentIntentEvent,
  isSuccessfulPaymentEvent
} from '@/types/paymongo-types';

interface WebhookResponse {
  received: boolean;
  processed?: boolean;
  error?: string;
}

// PayMongo webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<WebhookResponse>> {
  try {
    const payload = await req.text();
    const headersList = await headers();
    const signature = headersList.get('paymongo-signature');
    
    // Verify webhook signature (recommended for production)
    if (signature && process.env.PAYMONGO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        payload, 
        signature, 
        process.env.PAYMONGO_WEBHOOK_SECRET
      );
      
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ 
          received: false, 
          error: 'Invalid signature' 
        }, { status: 401 });
      }
    }

    const parsedEvent: unknown = JSON.parse(payload);
    
    if (!isWebhookEvent(parsedEvent)) {
      console.error('Invalid webhook event structure');
      return NextResponse.json({
        received: false,
        error: 'Invalid event structure'
      }, { status: 400 });
    }

    const event: WebhookEvent = parsedEvent;
    const eventType = event.data.attributes.type;
    
    console.log('Received webhook event:', eventType);
    
    let processed = false;
    
    // Handle different PayMongo events
    if (isCheckoutSessionEvent(eventType)) {
      if (isSuccessfulPaymentEvent(eventType)) {
        await handleCheckoutSessionSuccess(event);
        processed = true;
      } else if (eventType === 'checkout_session.payment.failed') {
        await handleCheckoutSessionFailed(event);
        processed = true;
      }
    } else if (isPaymentIntentEvent(eventType)) {
      if (isSuccessfulPaymentEvent(eventType)) {
        await handlePaymentIntentSuccess(event);
        processed = true;
      } else if (eventType === 'payment_intent.payment.failed') {
        await handlePaymentIntentFailed(event);
        processed = true;
      }
    } else {
      console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true, processed });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      received: true,
      processed: false,
      error: errorMessage
    }, { status: 500 });
  }
}

async function handleCheckoutSessionSuccess(event: WebhookEvent): Promise<void> {
  try {
    const checkoutSessionId = event.data.attributes.data.id;
    const sessionData = event.data.attributes.data.attributes as CheckoutSessionWebhookData;
    const metadata = sessionData.metadata;
    
    console.log('Processing successful checkout session payment:', checkoutSessionId);
    
    if (metadata?.reservation_id) {
      const updatedReservation = await prisma.reservation.update({
        where: { id: metadata.reservation_id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date(),
        },
        include: {
          guest: true,
          businessUnit: true
        }
      });
      
      console.log(`Checkout session payment confirmed for reservation ${metadata.reservation_id}`);
      
      // Here you could send confirmation email, SMS, etc.
      // await sendConfirmationEmail(updatedReservation);
    } else {
      console.error('No reservation_id found in checkout session metadata');
    }
  } catch (error) {
    console.error('Error handling checkout session success:', error);
    throw error;
  }
}

async function handleCheckoutSessionFailed(event: WebhookEvent): Promise<void> {
  try {
    const sessionData = event.data.attributes.data.attributes as CheckoutSessionWebhookData;
    const metadata = sessionData.metadata;
    
    console.log('Processing failed checkout session payment');
    
    if (metadata?.reservation_id) {
      await prisma.reservation.update({
        where: { id: metadata.reservation_id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          cancelledAt: new Date(),
        }
      });
      
      console.log(`Checkout session payment failed for reservation ${metadata.reservation_id}`);
    }
  } catch (error) {
    console.error('Error handling checkout session failure:', error);
    throw error;
  }
}

async function handlePaymentIntentSuccess(event: WebhookEvent): Promise<void> {
  try {
    const paymentIntentData = event.data.attributes.data.attributes as PaymentIntentWebhookData;
    const metadata = paymentIntentData.metadata;
    
    if (metadata?.reservation_id) {
      await prisma.reservation.update({
        where: { id: metadata.reservation_id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date(),
        }
      });
      
      console.log(`Payment Intent confirmed for reservation ${metadata.reservation_id}`);
    }
  } catch (error) {
    console.error('Error handling payment intent success:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(event: WebhookEvent): Promise<void> {
  try {
    const paymentIntentData = event.data.attributes.data.attributes as PaymentIntentWebhookData;
    const metadata = paymentIntentData.metadata;
    
    if (metadata?.reservation_id) {
      await prisma.reservation.update({
        where: { id: metadata.reservation_id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          cancelledAt: new Date(),
        }
      });
      
      console.log(`Payment Intent failed for reservation ${metadata.reservation_id}`);
    }
  } catch (error) {
    console.error('Error handling payment intent failure:', error);
    throw error;
  }
}