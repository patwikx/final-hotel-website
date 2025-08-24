// types/paymongo-webhook-extended.ts
// Strict types for PayMongo webhook data without any usage

// Base PayMongo resource structure
export interface PayMongoResource<T = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: T;
}

// Source types (payment methods)
export interface CardSource {
  id: string;
  type: 'card';
  brand: string;
  country: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export interface GCashSource {
  id: string;
  type: 'gcash';
  redirect?: {
    success: string;
    failed: string;
  };
}

export interface GrabPaySource {
  id: string;
  type: 'grabpay';
  redirect?: {
    success: string;
    failed: string;
  };
}

export interface PayMayaSource {
  id: string;
  type: 'paymaya';
  redirect?: {
    success: string;
    failed: string;
  };
}

export interface BankTransferSource {
  id: string;
  type: 'billease' | 'dob' | 'dob_ubp' | 'brankas_bdo' | 'brankas_landbank' | 'brankas_metrobank';
  redirect?: {
    success: string;
    failed: string;
  };
}

// Union type for all possible sources
export type PayMongoSource = 
  | CardSource 
  | GCashSource 
  | GrabPaySource 
  | PayMayaSource 
  | BankTransferSource;

// Payment error structure
export interface PayMongoPaymentError {
  code: string;
  detail: string;
  source?: {
    id: string;
    type: string;
  };
}

// Refund structure
export interface PayMongoRefundAttributes {
  amount: number;
  currency: string;
  reason?: string;
  status: 'pending' | 'succeeded' | 'failed';
  created_at: number;
  updated_at: number;
  payment_id: string;
  payout?: string;
  metadata?: Record<string, string>;
}

export interface PayMongoRefund extends PayMongoResource<PayMongoRefundAttributes> {
  type: 'refund';
}

// Payment structure
export interface PayMongoPaymentAttributes {
  access_url?: string;
  amount: number;
  currency: string;
  description?: string;
  disputed: boolean;
  external_reference_number?: string;
  fee: number;
  livemode: boolean;
  net_amount: number;
  origin: string;
  payment_intent_id: string;
  source: PayMongoSource;
  statement_descriptor?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  tax_amount?: number;
  created_at: number;
  updated_at: number;
  refunds?: PayMongoRefund[];
  metadata?: Record<string, string>;
}

export interface PayMongoPayment extends PayMongoResource<PayMongoPaymentAttributes> {
  type: 'payment';
}

// Line item structure for checkout sessions
export interface CheckoutLineItem {
  currency: string;
  amount: number;
  description?: string;
  name: string;
  quantity: number;
  images?: string[];
}

// Base checkout session attributes
export interface CheckoutSessionWebhookData {
  billing_information_fields_editable?: string;
  cancel_url?: string;
  client_key?: string;
  created_at: number;
  currency?: string;
  description?: string;
  line_items: CheckoutLineItem[];
  livemode: boolean;
  metadata?: Record<string, string>;
  payment_method_types?: string[];
  reference_number?: string;
  status: 'active' | 'cancelled' | 'expired';
  success_url?: string;
  updated_at: number;
  url?: string;
  payment_intent?: PayMongoResource<PaymentIntentAttributes>;
}

// Payment Intent attributes
export interface PaymentIntentAttributes {
  amount: number;
  currency: string;
  capture_type?: 'automatic' | 'manual';
  client_key?: string;
  created_at: number;
  description?: string;
  livemode: boolean;
  metadata?: Record<string, string>;
  next_action?: {
    type: string;
    redirect?: {
      url: string;
      return_url: string;
    };
  };
  payment_method_allowed?: string[];
  payment_method_options?: Record<string, unknown>;
  payments?: PayMongoPayment[];
  statement_descriptor?: string;
  status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'cancelled';
  updated_at: number;
  last_payment_error?: PayMongoPaymentError;
  setup_future_usage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaymentIntentWebhookData extends PaymentIntentAttributes {}

// Extended versions with additional computed fields
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtendedCheckoutSessionWebhookData extends CheckoutSessionWebhookData {
  // No additional fields needed since PayMongo provides everything we need
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtendedPaymentIntentWebhookData extends PaymentIntentWebhookData {
  // No additional fields needed since PayMongo provides everything we need
}

// Webhook event types - strictly typed
export type CheckoutSessionEventType = 
  | 'checkout_session.payment.paid'
  | 'checkout_session.payment.failed';

export type PaymentIntentEventType = 
  | 'payment_intent.payment.paid'
  | 'payment_intent.payment.failed'
  | 'payment_intent.succeeded'
  | 'payment_intent.processing'
  | 'payment_intent.payment.created';

export type PayMongoEventType = CheckoutSessionEventType | PaymentIntentEventType;

// Webhook event structure
export interface WebhookEventData<T = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: {
    type: PayMongoEventType;
    livemode: boolean;
    created_at: number;
    data: PayMongoResource<T>;
  };
}

export interface WebhookEvent {
  data: WebhookEventData<CheckoutSessionWebhookData | PaymentIntentWebhookData>;
}

// Type guards with proper typing
export function isWebhookEvent(data: unknown): data is WebhookEvent {
  if (!data || typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  return (
    'data' in obj &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'id' in obj.data &&
    'type' in obj.data &&
    'attributes' in obj.data &&
    typeof obj.data.attributes === 'object' &&
    obj.data.attributes !== null
  );
}

export function isCheckoutSessionEvent(eventType: string): eventType is CheckoutSessionEventType {
  return eventType.startsWith('checkout_session.');
}

export function isPaymentIntentEvent(eventType: string): eventType is PaymentIntentEventType {
  return eventType.startsWith('payment_intent.');
}

export function isSuccessfulPaymentEvent(eventType: string): boolean {
  return eventType.includes('.payment.paid') || eventType === 'payment_intent.succeeded';
}

export function isCheckoutSessionData(data: unknown): data is CheckoutSessionWebhookData {
  if (!data || typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  return (
    'line_items' in obj &&
    Array.isArray(obj.line_items) &&
    'status' in obj &&
    typeof obj.status === 'string'
  );
}

export function isPaymentIntentData(data: unknown): data is PaymentIntentWebhookData {
  if (!data || typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  return (
    'amount' in obj &&
    typeof obj.amount === 'number' &&
    'currency' in obj &&
    typeof obj.currency === 'string' &&
    'status' in obj &&
    typeof obj.status === 'string'
  );
}

// Utility functions with proper return types
export function getPaymentIntentFromSession(
  sessionData: CheckoutSessionWebhookData
): PayMongoResource<PaymentIntentAttributes> | null {
  return sessionData.payment_intent || null;
}

export function getClientKeyFromCheckoutSession(data: CheckoutSessionWebhookData): string | null {
  return data.client_key || null;
}

export function getClientKeyFromPaymentIntent(data: PaymentIntentWebhookData): string | null {
  return data.client_key || null;
}

export function getPaymentDetails(intentData: PaymentIntentWebhookData): PayMongoPayment | null {
  return intentData.payments?.[0] || null;
}

export function getSourceDetails(payment: PayMongoPayment): PayMongoSource {
  return payment.attributes.source;
}

export function getLastPaymentError(intentData: PaymentIntentWebhookData): PayMongoPaymentError | null {
  return intentData.last_payment_error || null;
}

// Safe accessors for payment source details
export function getCardDetails(source: PayMongoSource): CardSource | null {
  return source.type === 'card' ? source as CardSource : null;
}

export function isCardSource(source: PayMongoSource): source is CardSource {
  return source.type === 'card';
}

export function isEWalletSource(source: PayMongoSource): source is GCashSource | GrabPaySource | PayMayaSource {
  return ['gcash', 'grabpay', 'paymaya'].includes(source.type);
}

export function isBankTransferSource(source: PayMongoSource): source is BankTransferSource {
  return ['billease', 'dob', 'dob_ubp', 'brankas_bdo', 'brankas_landbank', 'brankas_metrobank'].includes(source.type);
}

// Helper to extract metadata safely
export function getMetadataValue(
  metadata: Record<string, string> | undefined, 
  key: string
): string | null {
  return metadata?.[key] || null;
}

// Helper to calculate total amount from line items
export function calculateTotalFromLineItems(lineItems: CheckoutLineItem[]): number {
  return lineItems.reduce((total, item) => total + (item.amount * item.quantity), 0);
}

// Helper to get payment method string for database storage
export function getPaymentMethodForDB(source: PayMongoSource): 'CARD' | 'GCASH' | 'GRABPAY' | 'PAYMAYA' | 'BANK_TRANSFER' {
  switch (source.type) {
    case 'card':
      return 'CARD';
    case 'gcash':
      return 'GCASH';
    case 'grabpay':
      return 'GRABPAY';
    case 'paymaya':
      return 'PAYMAYA';
    case 'billease':
    case 'dob':
    case 'dob_ubp':
    case 'brankas_bdo':
    case 'brankas_landbank':
    case 'brankas_metrobank':
      return 'BANK_TRANSFER';
    default:
      return 'CARD'; // fallback
  }
}