import { NextRequest, NextResponse } from 'next/server';
import { paymentOperations } from '@/lib/prisma';

// x402 webhook signature verification
function verifyX402Signature(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Webhook payload interface
interface X402WebhookPayload {
  paymentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  amount: string;
  currency: string;
  network: string;
  timestamp: string;
  merchantId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-x402-signature');
    const webhookSecret = process.env.X402_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error('Missing webhook signature or secret');
      return NextResponse.json(
        { error: 'Invalid webhook configuration' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyX402Signature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload: X402WebhookPayload = JSON.parse(rawBody);

    console.log('X402 webhook received:', {
      paymentId: payload.paymentId,
      status: payload.status,
      transactionHash: payload.transactionHash
    });

    // Validate payload
    if (!payload.paymentId || !payload.status) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Update payment status in database
    const updatedPayment = await paymentOperations.updateStatus(
      payload.paymentId,
      payload.status,
      {
        transactionHash: payload.transactionHash,
        blockNumber: payload.blockNumber,
        gasUsed: payload.gasUsed
      }
    );

    if (!updatedPayment) {
      console.error('Payment not found for ID:', payload.paymentId);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If payment completed successfully, trigger Veo prompt generation
    if (payload.status === 'COMPLETED' && updatedPayment.briefId) {
      try {
        // Make internal API call to generate Veo prompt
        const generateResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/briefs/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}` // Add this env var
          },
          body: JSON.stringify({
            briefId: updatedPayment.briefId,
            brandId: updatedPayment.brandId,
            // Include cached prompt request data from brief
            // TODO: Fix type issue with brandInfo
            // ...updatedPayment.brief?.brandInfo,
            paymentVerified: true
          })
        });

        if (!generateResponse.ok) {
          console.error('Failed to generate Veo prompt after payment:', await generateResponse.text());
        } else {
          console.log('Veo prompt generated successfully for payment:', payload.paymentId);
        }

      } catch (generateError) {
        console.error('Error triggering Veo prompt generation:', generateError);
        // Don't fail the webhook, payment was successful
      }
    }

    // Send success response
    return NextResponse.json({
      success: true,
      paymentId: payload.paymentId,
      status: payload.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'x402-webhook',
    timestamp: new Date().toISOString()
  });
}