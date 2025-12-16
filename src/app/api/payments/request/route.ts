import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { paymentOperations } from '@/lib/prisma';

// x402 payment request configuration
const X402_PAYMENT_CONFIG = {
  network: 'scroll-sepolia', // Use testnet for development
  currency: 'ETH',
  paymentUrl: process.env.X402_PAYMENT_URL || 'https://api.x402.protocol/payments',
  merchantId: process.env.X402_MERCHANT_ID,
  webhookSecret: process.env.X402_WEBHOOK_SECRET
};

// Payment amounts in Wei (10^18 Wei = 1 ETH)
const PAYMENT_AMOUNTS = {
  basic_prompt: '5000000000000000', // 0.005 ETH (~$12 USD)
  premium_prompt: '10000000000000000', // 0.01 ETH (~$24 USD)
  enterprise_prompt: '25000000000000000' // 0.025 ETH (~$60 USD)
};

interface PaymentRequestBody {
  briefId?: string;
  brandId: string;
  promptType: 'basic_prompt' | 'premium_prompt' | 'enterprise_prompt';
  memo?: string;
  callbackUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequestBody = await request.json();

    // Validate required fields
    if (!body.brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    if (!body.promptType || !PAYMENT_AMOUNTS[body.promptType]) {
      return NextResponse.json(
        { error: 'Valid prompt type is required (basic_prompt, premium_prompt, enterprise_prompt)' },
        { status: 400 }
      );
    }

    // Generate unique payment ID
    const paymentId = uuidv4();
    const amount = PAYMENT_AMOUNTS[body.promptType];

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create x402 payment request
    const paymentRequest = {
      paymentId,
      merchantId: X402_PAYMENT_CONFIG.merchantId,
      amount,
      currency: X402_PAYMENT_CONFIG.currency,
      network: X402_PAYMENT_CONFIG.network,
      memo: body.memo || `Veo prompt generation - ${body.promptType}`,
      callbackUrl: body.callbackUrl,
      expiresAt: expiresAt.toISOString()
    };

    // Generate x402 payment URL
    const paymentUrl = `${X402_PAYMENT_CONFIG.paymentUrl}/${paymentId}`;

    // Store payment request in database
    const payment = await paymentOperations.createRequest({
      paymentId,
      briefId: body.briefId,
      brandId: body.brandId,
      amount,
      currency: X402_PAYMENT_CONFIG.currency,
      network: X402_PAYMENT_CONFIG.network,
      paymentUrl,
      expiresAt,
      memo: paymentRequest.memo
    });

    // Return x402 payment response
    return NextResponse.json({
      paymentId,
      paymentUrl,
      amount,
      currency: X402_PAYMENT_CONFIG.currency,
      network: X402_PAYMENT_CONFIG.network,
      expiresAt: expiresAt.toISOString(),
      qrCode: `${paymentUrl}?format=qr`, // x402 QR code URL
      status: 'PENDING',
      instructions: {
        title: 'Complete Payment to Generate Veo Prompt',
        steps: [
          'Connect your Web3 wallet',
          'Confirm the transaction on Scroll network',
          'Wait for transaction confirmation',
          'Your Veo prompt will be generated automatically'
        ]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Payment request creation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create payment request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }

  try {
    const payment = await paymentOperations.getByPaymentId(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      network: payment.network,
      createdAt: payment.createdAt,
      expiresAt: payment.expiresAt,
      completedAt: payment.completedAt,
      transactionHash: payment.transactionHash,
      brief: payment.brief ? {
        id: payment.brief.id,
        hook: payment.brief.hook,
        status: 'generated'
      } : null
    });

  } catch (error) {
    console.error('Payment status retrieval error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}