// api/webhooks/paymongo/route.ts
// Updated webhook handler with strict TypeScript types - no "any" usage

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { 
  WebhookEvent, 
  CheckoutSessionWebhookData, 
  PaymentIntentWebhookData,
  isWebhookEvent,
  isCheckoutSessionEvent,
  isPaymentIntentEvent,
  isSuccessfulPaymentEvent,
  isCheckoutSessionData,
  isPaymentIntentData,
  getPaymentIntentFromSession,
  getPaymentDetails,
  getSourceDetails,
  getLastPaymentError,
  getMetadataValue,
  calculateTotalFromLineItems,
  getPaymentMethodForDB,
  isCardSource,
  PayMongoPayment,
  PayMongoSource
} from '@/types/paymongo-webhook-extended';

interface WebhookResponse {
  received: boolean;
  processed?: boolean;
  error?: string;
}

// Helper function to get IP address
function getClientIP(req: NextRequest, headersList: Headers): string {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    headersList.get('x-client-ip') ||
    'unknown'
  );
}

// Helper function to safely serialize webhook data for JSON storage (Prisma JSON compatible)
function serializeForPrismaJson(data: unknown): Prisma.InputJsonValue {
  // Convert to JSON string and back to ensure it's serializable and compatible with Prisma
  return JSON.parse(JSON.stringify(data));
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
  let webhookEventRecord: { id: string } | null = null;
  
  try {
    const payload = await req.text();
    const headersList = await headers();
    const signature = headersList.get('paymongo-signature');
    const userAgent = headersList.get('user-agent');
    const ipAddress = getClientIP(req, headersList);
    
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
    const resourceId = event.data.attributes.data.id;
    
    console.log('Received webhook event:', eventType, 'for resource:', resourceId);

    // Check if this webhook event was already processed
    const existingWebhookEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.data.id }
    });

    if (existingWebhookEvent?.processed) {
      console.log('Webhook event already processed:', event.data.id);
      return NextResponse.json({ 
        received: true, 
        processed: true 
      });
    }

    // Create headers object for serialization
    const headersObject: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObject[key] = value;
    });

    // Create or update webhook event record
    webhookEventRecord = await prisma.webhookEvent.upsert({
      where: { eventId: event.data.id },
      update: {
        retryCount: { increment: 1 },
        status: 'processing'
      },
      create: {
        eventId: event.data.id,
        eventType: eventType,
        resourceType: event.data.attributes.data.type,
        resourceId: resourceId,
        signature: signature || '',
        payload: serializeForPrismaJson(event),
        headers: serializeForPrismaJson(headersObject),
        ipAddress: ipAddress,
        userAgent: userAgent || '',
        status: 'processing'
      }
    });
    
    let processed = false;
    
    // Handle different PayMongo events
    if (isCheckoutSessionEvent(eventType)) {
      if (isSuccessfulPaymentEvent(eventType)) {
        await handleCheckoutSessionSuccess(event, webhookEventRecord.id);
        processed = true;
      } else if (eventType === 'checkout_session.payment.failed') {
        await handleCheckoutSessionFailed(event, webhookEventRecord.id);
        processed = true;
      }
    } else if (isPaymentIntentEvent(eventType)) {
      if (isSuccessfulPaymentEvent(eventType)) {
        await handlePaymentIntentSuccess(event, webhookEventRecord.id);
        processed = true;
      } else if (eventType === 'payment_intent.payment.failed') {
        await handlePaymentIntentFailed(event, webhookEventRecord.id);
        processed = true;
      }
    } else {
      console.log('Unhandled webhook event:', eventType);
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { id: webhookEventRecord.id },
      data: {
        processed: true,
        processedAt: new Date(),
        status: processed ? 'processed' : 'ignored'
      }
    });

    return NextResponse.json({ received: true, processed });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Mark webhook as failed if we have a record
    if (webhookEventRecord) {
      try {
        await prisma.webhookEvent.update({
          where: { id: webhookEventRecord.id },
          data: {
            status: 'failed',
            error: errorMessage,
            nextRetryAt: new Date(Date.now() + 5 * 60 * 1000) // Retry in 5 minutes
          }
        });
      } catch (updateError) {
        console.error('Failed to update webhook event record:', updateError);
      }
    }
    
    return NextResponse.json({
      received: true,
      processed: false,
      error: errorMessage
    }, { status: 500 });
  }
}

async function handleCheckoutSessionSuccess(event: WebhookEvent, webhookEventId: string): Promise<void> {
  try {
    const checkoutSessionId = event.data.attributes.data.id;
    const sessionData = event.data.attributes.data.attributes;
    
    if (!isCheckoutSessionData(sessionData)) {
      console.error('Invalid checkout session data structure');
      return;
    }
    
    const typedSessionData: CheckoutSessionWebhookData = sessionData;
    
    console.log('Processing successful checkout session payment:', checkoutSessionId);
    
    const reservationId = getMetadataValue(typedSessionData.metadata, 'reservation_id');
    if (!reservationId) {
      console.error('No reservation_id found in checkout session metadata');
      return;
    }

    // Get the reservation to ensure it exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { payments: true }
    });

    if (!reservation) {
      console.error('Reservation not found:', reservationId);
      return;
    }

    // Extract payment intent from session data (if available)
    const paymentIntent = getPaymentIntentFromSession(typedSessionData);
    const paymentIntentId = paymentIntent?.id;
    
    // Find or create the payment record
    let payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { checkoutSessionId: checkoutSessionId },
          ...(paymentIntentId ? [{ providerPaymentId: paymentIntentId }] : [])
        ]
      }
    });

    const totalAmount = calculateTotalFromLineItems(typedSessionData.line_items) / 100;

    if (!payment) {
      // Create new payment record
      payment = await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          amount: totalAmount,
          currency: typedSessionData.line_items[0]?.currency?.toUpperCase() || 'PHP',
          method: 'CARD', // Default, will be updated with actual method
          status: 'PROCESSING',
          provider: 'paymongo',
          providerPaymentId: paymentIntentId || checkoutSessionId,
          clientKey: typedSessionData.client_key || '',
          checkoutSessionId: checkoutSessionId,
          paymentFlow: 'checkout',
          webhookEventId: webhookEventId,
          rawPayload: serializeForPrismaJson(event.data.attributes.data)
        }
      });
    }

    // Extract payment details if available
    const updateData: Partial<Prisma.PaymentUpdateInput> = {
      status: 'SUCCEEDED',
      processedAt: new Date(),
      capturedAt: new Date(),
      webhookEventId: webhookEventId,
      rawPayload: serializeForPrismaJson(event.data.attributes.data)
    };

    if (paymentIntent && isPaymentIntentData(paymentIntent.attributes)) {
      const paymentDetails = getPaymentDetails(paymentIntent.attributes);
      
      if (paymentDetails) {
        updateData.netAmount = paymentDetails.attributes.net_amount / 100;
        updateData.fee = paymentDetails.attributes.fee / 100;
        
        const source = getSourceDetails(paymentDetails);
        updateData.paymentMethod = source.type;
        updateData.method = getPaymentMethodForDB(source);
        
        // Safely access card details
        if (isCardSource(source)) {
          updateData.cardBrand = source.brand;
          updateData.cardLast4 = source.last4;
          updateData.cardCountry = source.country;
        }
      }
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData
    });

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
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
    
    console.log(`Checkout session payment confirmed for reservation ${reservationId}`);
    
    // Here you could send confirmation email, SMS, etc.
    // await sendConfirmationEmail(updatedReservation);
    // await sendConfirmationSMS(updatedReservation);
    
  } catch (error) {
    console.error('Error handling checkout session success:', error);
    throw error;
  }
}

async function handleCheckoutSessionFailed(event: WebhookEvent, webhookEventId: string): Promise<void> {
  try {
    const checkoutSessionId = event.data.attributes.data.id;
    const sessionData = event.data.attributes.data.attributes;
    
    if (!isCheckoutSessionData(sessionData)) {
      console.error('Invalid checkout session data structure');
      return;
    }
    
    const typedSessionData: CheckoutSessionWebhookData = sessionData;
    
    console.log('Processing failed checkout session payment:', checkoutSessionId);
    
    const reservationId = getMetadataValue(typedSessionData.metadata, 'reservation_id');
    if (!reservationId) {
      console.error('No reservation_id found in checkout session metadata');
      return;
    }

    const paymentIntent = getPaymentIntentFromSession(typedSessionData);
    const paymentIntentId = paymentIntent?.id;

    // Find the payment record
    let payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { checkoutSessionId: checkoutSessionId },
          ...(paymentIntentId ? [{ providerPaymentId: paymentIntentId }] : [])
        ]
      }
    });

    const totalAmount = calculateTotalFromLineItems(typedSessionData.line_items) / 100;

    if (!payment) {
      // Create payment record for failed payment tracking
      payment = await prisma.payment.create({
        data: {
          reservationId: reservationId,
          amount: totalAmount,
          currency: typedSessionData.line_items[0]?.currency?.toUpperCase() || 'PHP',
          method: 'CARD',
          status: 'FAILED',
          provider: 'paymongo',
          providerPaymentId: paymentIntentId || checkoutSessionId,
          checkoutSessionId: checkoutSessionId,
          paymentFlow: 'checkout',
          webhookEventId: webhookEventId
        }
      });
    }

    // Extract failure details
    let failureCode: string | undefined;
    let failureMessage: string | undefined;
    
    if (paymentIntent && isPaymentIntentData(paymentIntent.attributes)) {
      const lastError = getLastPaymentError(paymentIntent.attributes);
      if (lastError) {
        failureCode = lastError.code;
        failureMessage = lastError.detail;
      }
    }
    
    // Update payment with failure details
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
        failureCode: failureCode,
        failureMessage: failureMessage,
        webhookEventId: webhookEventId,
        rawPayload: serializeForPrismaJson(event.data.attributes.data)
      }
    });

    // Update reservation status
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Payment failed'
      }
    });
    
    console.log(`Checkout session payment failed for reservation ${reservationId}`);
    
    // Here you could send failure notification email
    // await sendPaymentFailureEmail(reservation);
    
  } catch (error) {
    console.error('Error handling checkout session failure:', error);
    throw error;
  }
}

async function handlePaymentIntentSuccess(event: WebhookEvent, webhookEventId: string): Promise<void> {
  try {
    const paymentIntentId = event.data.attributes.data.id;
    const intentData = event.data.attributes.data.attributes;
    
    if (!isPaymentIntentData(intentData)) {
      console.error('Invalid payment intent data structure');
      return;
    }
    
    const typedIntentData: PaymentIntentWebhookData = intentData;
    
    console.log('Processing successful payment intent:', paymentIntentId);
    
    const reservationId = getMetadataValue(typedIntentData.metadata, 'reservation_id');
    if (!reservationId) {
      console.error('No reservation_id found in payment intent metadata');
      return;
    }

    // Find or create payment record
    let payment = await prisma.payment.findUnique({
      where: { providerPaymentId: paymentIntentId }
    });

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          reservationId: reservationId,
          amount: typedIntentData.amount / 100,
          currency: typedIntentData.currency.toUpperCase(),
          method: 'CARD',
          status: 'PROCESSING',
          provider: 'paymongo',
          providerPaymentId: paymentIntentId,
          clientKey: typedIntentData.client_key || '',
          paymentFlow: 'direct',
          webhookEventId: webhookEventId
        }
      });
    }

    // Extract payment details
    const paymentDetails = getPaymentDetails(typedIntentData);
    
    const updateData: Partial<Prisma.PaymentUpdateInput> = {
      status: 'SUCCEEDED',
      processedAt: new Date(),
      capturedAt: new Date(),
      webhookEventId: webhookEventId,
      rawPayload: serializeForPrismaJson(event.data.attributes.data)
    };

    if (paymentDetails) {
      updateData.netAmount = paymentDetails.attributes.net_amount / 100;
      updateData.fee = paymentDetails.attributes.fee / 100;
      
      const source = getSourceDetails(paymentDetails);
      updateData.paymentMethod = source.type;
      updateData.method = getPaymentMethodForDB(source);
      
      // Safely access card details
      if (isCardSource(source)) {
        updateData.cardBrand = source.brand;
        updateData.cardLast4 = source.last4;
        updateData.cardCountry = source.country;
      }
    }

    // Update payment with success details
    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData
    });

    // Update reservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paidAt: new Date(),
      }
    });
    
    console.log(`Payment Intent confirmed for reservation ${reservationId}`);
    
  } catch (error) {
    console.error('Error handling payment intent success:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(event: WebhookEvent, webhookEventId: string): Promise<void> {
  try {
    const paymentIntentId = event.data.attributes.data.id;
    const intentData = event.data.attributes.data.attributes;
    
    if (!isPaymentIntentData(intentData)) {
      console.error('Invalid payment intent data structure');
      return;
    }
    
    const typedIntentData: PaymentIntentWebhookData = intentData;
    
    console.log('Processing failed payment intent:', paymentIntentId);
    
    const reservationId = getMetadataValue(typedIntentData.metadata, 'reservation_id');
    if (!reservationId) {
      console.error('No reservation_id found in payment intent metadata');
      return;
    }

    // Find or create payment record
    let payment = await prisma.payment.findUnique({
      where: { providerPaymentId: paymentIntentId }
    });

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          reservationId: reservationId,
          amount: typedIntentData.amount / 100,
          currency: typedIntentData.currency.toUpperCase(),
          method: 'CARD',
          status: 'FAILED',
          provider: 'paymongo',
          providerPaymentId: paymentIntentId,
          paymentFlow: 'direct',
          webhookEventId: webhookEventId
        }
      });
    }

    // Extract failure details
    const lastError = getLastPaymentError(typedIntentData);
    
    // Update payment with failure details
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
        failureCode: lastError?.code,
        failureMessage: lastError?.detail,
        webhookEventId: webhookEventId,
        rawPayload: serializeForPrismaJson(event.data.attributes.data)
      }
    });

    // Update reservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Payment failed'
      }
    });
    
    console.log(`Payment Intent failed for reservation ${reservationId}`);
    
  } catch (error) {
    console.error('Error handling payment intent failure:', error);
    throw error;
  }
}