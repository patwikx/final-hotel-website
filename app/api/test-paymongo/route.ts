// 4. Test PayMongo connection: /api/test-paymongo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { paymongo } from '@/lib/paymongo';

export async function GET(req: NextRequest) {
  try {
    // Test creating a simple checkout session
    const testSession = await paymongo.createCheckoutSession({
      cancel_url: 'http://localhost:3000/test-cancel',
      success_url: 'http://localhost:3000/test-success',
      line_items: [
        {
          currency: 'PHP',
          amount: 10000, // ₱100.00 in centavos
          description: 'Test Payment',
          name: 'Test Item',
          quantity: 1,
        }
      ],
      payment_method_types: ['card', 'gcash'],
      description: 'PayMongo Connection Test',
    });

    return NextResponse.json({
      success: true,
      message: 'PayMongo connection successful',
      sessionId: testSession.data.id,
      checkoutUrl: testSession.data.attributes.checkout_url,
    });

  } catch (error) {
    console.error('PayMongo connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'PayMongo connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}