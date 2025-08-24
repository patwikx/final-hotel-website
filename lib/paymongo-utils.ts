import { CheckoutSessionWebhookData, PaymentIntentWebhookData, WebhookEvent } from "@/types/paymongo-types";

// 5. Type-safe utility functions: lib/paymongo-utils.ts
export function validateWebhookEvent(event: unknown): event is WebhookEvent {
  if (typeof event !== 'object' || event === null) {
    return false;
  }

  const e = event as Record<string, unknown>;
  
  return (
    typeof e.data === 'object' &&
    e.data !== null &&
    typeof (e.data as Record<string, unknown>).id === 'string' &&
    typeof (e.data as Record<string, unknown>).type === 'string' &&
    typeof (e.data as Record<string, unknown>).attributes === 'object'
  );
}

export function isCheckoutSessionEvent(eventType: string): boolean {
  return eventType === 'checkout_session.payment.paid' || eventType === 'checkout_session.payment.failed';
}

export function isPaymentIntentEvent(eventType: string): boolean {
  return eventType === 'payment_intent.payment.paid' || eventType === 'payment_intent.payment.failed';
}

export function formatPayMongoAmount(amount: number): number {
  // Convert PHP amount to centavos (multiply by 100)
  return Math.round(amount * 100);
}

export function formatDisplayAmount(centavos: number): number {
  // Convert centavos back to PHP amount (divide by 100)
  return centavos / 100;
}

// Type guard for checkout session webhook data
export function isCheckoutSessionWebhookData(data: unknown): data is CheckoutSessionWebhookData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const d = data as Record<string, unknown>;
  
  return (
    typeof d.checkout_url === 'string' &&
    typeof d.status === 'string' &&
    Array.isArray(d.line_items) &&
    Array.isArray(d.payment_method_types)
  );
}

// Type guard for payment intent webhook data  
export function isPaymentIntentWebhookData(data: unknown): data is PaymentIntentWebhookData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const d = data as Record<string, unknown>;
  
  return (
    typeof d.amount === 'number' &&
    typeof d.currency === 'string' &&
    typeof d.status === 'string'
  );
}