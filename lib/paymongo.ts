// 1. Create PayMongo REST API client: lib/paymongo.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

// PayMongo API Response Types
interface PayMongoError {
  code: string;
  detail: string;
  source?: {
    pointer: string;
    parameter: string;
  };
}

interface PayMongoErrorResponse {
  errors: PayMongoError[];
}

interface PayMongoResponse<T> {
  data: {
    id: string;
    type: string;
    attributes: T;
  };
}

interface CheckoutSessionAttributes {
  checkout_url: string;
  reference_number?: string;
  status: 'active' | 'paid' | 'expired';
  customer_email?: string;
  line_items: Array<{
    currency: string;
    amount: number;
    description: string;
    name: string;
    quantity: number;
  }>;
  payment_method_types: string[];
  metadata?: Record<string, string>;
  created_at: number;
  updated_at: number;
}

interface PaymentIntentAttributes {
  amount: number;
  currency: string;
  description?: string;
  status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'cancelled';
  client_key: string;
  metadata?: Record<string, string>;
  created_at: number;
  updated_at: number;
}

class PayMongoClient {
  private client: AxiosInstance;
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
    this.client = axios.create({
      baseURL: 'https://api.paymongo.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(secretKey).toString('base64')}`,
      },
    });
  }

  // Create a checkout session
  async createCheckoutSession(data: CheckoutSessionData): Promise<PayMongoResponse<CheckoutSessionAttributes>> {
    try {
      const response = await this.client.post<PayMongoResponse<CheckoutSessionAttributes>>('/checkout_sessions', {
        data: {
          attributes: data
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create checkout session');
      throw error; // This won't be reached due to handleError throwing
    }
  }

  // Get payment status
  async getCheckoutSession(sessionId: string): Promise<PayMongoResponse<CheckoutSessionAttributes>> {
    try {
      const response = await this.client.get<PayMongoResponse<CheckoutSessionAttributes>>(`/checkout_sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get checkout session');
      throw error;
    }
  }

  // Create a payment intent (alternative method)
  async createPaymentIntent(data: PaymentIntentData): Promise<PayMongoResponse<PaymentIntentAttributes>> {
    try {
      const response = await this.client.post<PayMongoResponse<PaymentIntentAttributes>>('/payment_intents', {
        data: {
          attributes: data
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create payment intent');
      throw error;
    }
  }

  private handleError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<PayMongoErrorResponse>;
      const errorData = axiosError.response?.data;
      const errorMessage = errorData?.errors?.[0]?.detail || axiosError.message || 'Unknown PayMongo error';
      
      console.error(`PayMongo API Error (${context}):`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: errorData,
        message: axiosError.message
      });
      
      throw new Error(`PayMongo Error: ${errorMessage}`);
    } else if (error instanceof Error) {
      console.error(`PayMongo Client Error (${context}):`, error.message);
      throw new Error(`PayMongo Error: ${error.message}`);
    } else {
      console.error(`Unknown error (${context}):`, error);
      throw new Error('PayMongo Error: Unknown error occurred');
    }
  }
}

// Types for PayMongo API
export interface CheckoutSessionData {
  cancel_url: string;
  success_url: string;
  line_items: Array<{
    currency: string;
    amount: number;
    description: string;
    name: string;
    quantity: number;
  }>;
  payment_method_types: string[];
  description?: string;
  customer_email?: string;
  billing?: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata?: Record<string, string>;
  reference_number?: string;
  send_email_receipt?: boolean;
  show_description?: boolean;
  show_line_items?: boolean;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description?: string;
  statement_descriptor?: string;
  metadata?: Record<string, string>;
}

export interface WebhookEvent {
  data: {
    id: string;
    type: string;
    attributes: {
      type: 'checkout_session.payment.paid' | 'checkout_session.payment.failed' | 'payment_intent.payment.paid' | 'payment_intent.payment.failed';
      livemode: boolean;
      data: {
        id: string;
        type: string;
        attributes: CheckoutSessionWebhookData | PaymentIntentWebhookData;
      };
      previous_data?: Record<string, unknown>;
      created_at: number;
      updated_at: number;
    };
  };
}

interface CheckoutSessionWebhookData {
  checkout_url: string;
  reference_number?: string;
  status: 'active' | 'paid' | 'expired';
  customer_email?: string;
  metadata?: Record<string, string>;
  line_items: Array<{
    currency: string;
    amount: number;
    description: string;
    name: string;
    quantity: number;
  }>;
  payment_method_types: string[];
}

interface PaymentIntentWebhookData {
  amount: number;
  currency: string;
  description?: string;
  status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'cancelled';
  metadata?: Record<string, string>;
}

// Create and export PayMongo client instance
export const paymongo = new PayMongoClient(process.env.PAYMONGO_SECRET_KEY!);