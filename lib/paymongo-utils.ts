// lib/payment-utils.ts
import { prisma } from '@/lib/prisma';

// Helper function to create payment record when creating PayMongo payment intent
export async function createPaymentRecord({
  reservationId,
  paymongoPaymentIntentId,
  clientKey,
  amount,
  currency = 'PHP',
  paymentFlow = 'direct',
  checkoutSessionId
}: {
  reservationId: string;
  paymongoPaymentIntentId: string;
  clientKey: string;
  amount: number;
  currency?: string;
  paymentFlow?: 'direct' | 'checkout';
  checkoutSessionId?: string;
}) {
  return await prisma.payment.create({
    data: {
      reservationId,
      amount,
      currency,
      method: 'CARD', // Will be updated by webhook
      status: 'PENDING',
      provider: 'paymongo',
      providerPaymentId: paymongoPaymentIntentId,
      clientKey,
      paymentFlow,
      checkoutSessionId,
      transactionDate: new Date()
    }
  });
}

// Helper function to get payment status for a reservation
export async function getPaymentStatus(reservationId: string) {
  const payments = await prisma.payment.findMany({
    where: { reservationId },
    orderBy: { createdAt: 'desc' }
  });

  if (payments.length === 0) {
    return { status: 'NO_PAYMENT', latestPayment: null };
  }

  const latestPayment = payments[0];
  const totalPaid = payments
    .filter(p => p.status === 'SUCCEEDED' || p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    status: latestPayment.status,
    totalPaid,
    latestPayment,
    allPayments: payments
  };
}

// Helper function to handle payment retries
export async function retryFailedPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { reservation: true }
  });

  if (!payment || payment.status !== 'FAILED') {
    throw new Error('Payment not found or not in failed state');
  }

  // Create a new payment attempt
  const attemptNumber = await prisma.paymentAttempt.count({
    where: { paymentId }
  }) + 1;

  await prisma.paymentAttempt.create({
    data: {
      paymentId,
      attemptNumber,
      status: 'pending',
      attemptedAt: new Date()
    }
  });

  // Update payment status to pending
  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PENDING',
      failureCode: null,
      failureMessage: null
    }
  });
}

// Helper function to process refunds
export async function processRefund({
  paymentId,
  amount,
  reason,
  paymongoRefundId
}: {
  paymentId: string;
  amount: number;
  reason?: string;
  paymongoRefundId: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const newRefundedAmount = Number(payment.refundedAmount || 0) + amount;
  const isFullRefund = newRefundedAmount >= Number(payment.amount);

  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAmount: newRefundedAmount,
      refundReason: reason,
      refundedAt: new Date(),
      refundId: paymongoRefundId
    }
  });
}

// Helper function to get webhook events for debugging
export async function getWebhookEvents({
  resourceId,
  eventType,
  limit = 50
}: {
  resourceId?: string;
  eventType?: string;
  limit?: number;
}) {
  return await prisma.webhookEvent.findMany({
    where: {
      ...(resourceId && { resourceId }),
      ...(eventType && { eventType })
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

// Helper function to retry failed webhook events
export async function retryFailedWebhooks() {
  const failedEvents = await prisma.webhookEvent.findMany({
    where: {
      status: 'failed',
      retryCount: { lt: 3 }, // Max 3 retries
      nextRetryAt: { lte: new Date() }
    },
    take: 10 // Process 10 at a time
  });

  console.log(`Found ${failedEvents.length} failed webhook events to retry`);

  for (const event of failedEvents) {
    try {
      // You would re-process the webhook event here
      // This is a simplified example
      console.log(`Retrying webhook event ${event.id}`);
      
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: {
          retryCount: { increment: 1 },
          status: 'processing',
          nextRetryAt: new Date(Date.now() + (event.retryCount + 1) * 5 * 60 * 1000) // Exponential backoff
        }
      });
    } catch (error) {
      console.error(`Failed to retry webhook event ${event.id}:`, error);
    }
  }
}

// Helper function to clean up old webhook events
export async function cleanupOldWebhookEvents(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.webhookEvent.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      processed: true
    }
  });

  console.log(`Cleaned up ${result.count} old webhook events`);
  return result.count;
}