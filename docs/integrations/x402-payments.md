# x402 Micropayment Protocol Integration

## Overview

x402 provides instant, low-cost micropayments for creator compensation in Arcadia. This protocol enables sub-$50 payments that are economically viable through HTTP status code 402 (Payment Required) semantics.

## Protocol Implementation

### Basic x402 Flow
```typescript
// types/x402.ts
export interface X402PaymentRequest {
  amount: string; // In ETH or token amount
  recipient: string; // Creator wallet address
  memo?: string; // Payment description
  network: 'scroll-zk' | 'ethereum';
  contentId: string; // Associated content identifier
}

export interface X402PaymentResponse {
  paymentUrl: string; // Payment interface URL
  paymentId: string; // Unique payment identifier
  expiresAt: string; // Payment expiration timestamp
  qrCode?: string; // QR code for mobile payments
}
```

### API Implementation
```typescript
// app/api/payments/request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePaymentRequest } from '@/lib/x402';

export async function POST(request: NextRequest) {
  try {
    const { creatorAddress, amount, contentId, memo } = await request.json();

    // Validate payment request
    if (!creatorAddress || !amount || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate x402 payment request
    const paymentRequest: X402PaymentRequest = {
      amount: amount.toString(),
      recipient: creatorAddress,
      memo: memo || `Payment for content: ${contentId}`,
      network: 'scroll-zk',
      contentId
    };

    const paymentResponse = await generatePaymentRequest(paymentRequest);

    // Return 402 Payment Required with payment details
    return NextResponse.json(paymentResponse, {
      status: 402,
      headers: {
        'X-Payment-Required': 'true',
        'X-Payment-Amount': amount.toString(),
        'X-Payment-Recipient': creatorAddress,
        'X-Payment-Network': 'scroll-zk'
      }
    });

  } catch (error) {
    console.error('Payment request error:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment request' },
      { status: 500 }
    );
  }
}
```

### Payment Generation
```typescript
// lib/x402.ts
import { v4 as uuidv4 } from 'uuid';
import { savePaymentRequest } from '@/lib/database';

export async function generatePaymentRequest(
  request: X402PaymentRequest
): Promise<X402PaymentResponse> {
  const paymentId = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Store payment request
  await savePaymentRequest({
    paymentId,
    amount: request.amount,
    recipient: request.recipient,
    contentId: request.contentId,
    network: request.network,
    status: 'pending',
    expiresAt
  });

  // Generate payment interface URL
  const paymentUrl = generatePaymentURL({
    paymentId,
    amount: request.amount,
    recipient: request.recipient,
    network: request.network,
    memo: request.memo
  });

  return {
    paymentId,
    paymentUrl,
    expiresAt: expiresAt.toISOString(),
    qrCode: generatePaymentQR(paymentUrl)
  };
}

function generatePaymentURL(params: {
  paymentId: string;
  amount: string;
  recipient: string;
  network: string;
  memo?: string;
}): string {
  const searchParams = new URLSearchParams({
    paymentId: params.paymentId,
    amount: params.amount,
    recipient: params.recipient,
    network: params.network,
    ...(params.memo && { memo: params.memo })
  });

  return `${process.env.NEXT_PUBLIC_APP_URL}/pay?${searchParams.toString()}`;
}
```

## Payment Interface

### Payment Page Component
```typescript
// app/pay/paymentInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { processPayment } from '@/lib/payment-processor';

interface PaymentInterfaceProps {
  paymentId: string;
  amount: string;
  recipient: string;
  network: string;
  memo?: string;
}

export function paymentInterface({
  paymentId,
  amount,
  recipient,
  network,
  memo
}: PaymentInterfaceProps) {
  const { wallet, connect, isConnected } = useWallet();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!wallet || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setPaymentStatus('processing');

    try {
      const txHash = await processPayment({
        amount,
        recipient,
        network,
        paymentId,
        wallet
      });

      setTransactionHash(txHash);
      setPaymentStatus('success');

      // Notify backend of payment completion
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, transactionHash: txHash })
      });

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Amount</label>
          <p className="text-lg font-semibold">{amount} ETH</p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">To</label>
          <p className="text-sm font-mono bg-muted p-2 rounded">
            {recipient.slice(0, 6)}...{recipient.slice(-4)}
          </p>
        </div>

        {memo && (
          <div>
            <label className="text-sm text-muted-foreground">Description</label>
            <p className="text-sm">{memo}</p>
          </div>
        )}

        <div>
          <label className="text-sm text-muted-foreground">Network</label>
          <p className="text-sm capitalize">{network}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {!isConnected ? (
          <button
            onClick={() => connect()}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handlePayment}
            disabled={paymentStatus === 'processing'}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded disabled:opacity-50"
          >
            {paymentStatus === 'processing' ? 'Processing...' : 'Pay Now'}
          </button>
        )}

        {paymentStatus === 'success' && (
          <div className="text-green-600 text-sm">
            Payment successful! Transaction: {transactionHash?.slice(0, 10)}...
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="text-red-600 text-sm">
            Payment failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
```

### Payment Processor
```typescript
// lib/payment-processor.ts
import { ethers } from 'ethers';

interface PaymentParams {
  amount: string;
  recipient: string;
  network: string;
  paymentId: string;
  wallet: any;
}

export async function processPayment({
  amount,
  recipient,
  network,
  paymentId,
  wallet
}: PaymentParams): Promise<string> {
  // Get network provider
  const provider = await getNetworkProvider(network);
  const signer = new ethers.Wallet(wallet.privateKey, provider);

  // Convert amount to wei
  const amountWei = ethers.utils.parseEther(amount);

  // Create transaction
  const transaction = {
    to: recipient,
    value: amountWei,
    data: ethers.utils.toUtf8Bytes(`x402:${paymentId}`), // Include payment ID in transaction data
    gasLimit: 21000 // Standard ETH transfer
  };

  // Send transaction
  const tx = await signer.sendTransaction(transaction);

  // Wait for confirmation
  await tx.wait(1);

  return tx.hash;
}

async function getNetworkProvider(network: string): Promise<ethers.providers.Provider> {
  switch (network) {
    case 'scroll-zk':
      return new ethers.providers.JsonRpcProvider(process.env.SCROLL_RPC_URL);
    case 'ethereum':
      return new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}
```

## Payment Verification

### Verification API
```typescript
// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentTransaction, updatePaymentStatus, releaseContentToBrand } from '@/lib/payment-verification';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, transactionHash } = await request.json();

    // Verify transaction on blockchain
    const verification = await verifyPaymentTransaction(transactionHash, paymentId);

    if (!verification.isValid) {
      return NextResponse.json(
        { error: 'Invalid transaction' },
        { status: 400 }
      );
    }

    // Update payment status
    await updatePaymentStatus(paymentId, 'completed', {
      transactionHash,
      blockNumber: verification.blockNumber,
      gasUsed: verification.gasUsed,
      verifiedAt: new Date()
    });

    // Release content to brand (if applicable)
    const payment = await getPaymentDetails(paymentId);
    if (payment.contentId) {
      await releaseContentToBrand(payment.contentId, payment.brandId);
    }

    // Notify creator of payment
    await notifyCreatorOfPayment(payment.creatorId, {
      amount: payment.amount,
      transactionHash,
      contentId: payment.contentId
    });

    return NextResponse.json({
      verified: true,
      status: 'payment_completed',
      transactionHash,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
```

### Blockchain Verification
```typescript
// lib/payment-verification.ts
import { ethers } from 'ethers';

export async function verifyPaymentTransaction(
  transactionHash: string,
  paymentId: string
): Promise<{
  isValid: boolean;
  blockNumber?: number;
  gasUsed?: number;
  amount?: string;
  recipient?: string;
}> {
  try {
    const provider = await getNetworkProvider('scroll-zk');

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) {
      return { isValid: false };
    }

    // Get transaction details
    const transaction = await provider.getTransaction(transactionHash);
    if (!transaction) {
      return { isValid: false };
    }

    // Verify payment ID in transaction data
    const paymentIdFromTx = extractPaymentIdFromTransactionData(transaction.data);
    if (paymentIdFromTx !== paymentId) {
      return { isValid: false };
    }

    return {
      isValid: true,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toNumber(),
      amount: ethers.utils.formatEther(transaction.value),
      recipient: transaction.to
    };

  } catch (error) {
    console.error('Transaction verification error:', error);
    return { isValid: false };
  }
}

function extractPaymentIdFromTransactionData(data: string): string | null {
  try {
    const decoded = ethers.utils.toUtf8String(data);
    const match = decoded.match(/^x402:(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
```

## Testing & Monitoring

### Unit Tests
```typescript
// tests/x402.test.ts
import { generatePaymentRequest, processPayment } from '@/lib/x402';

describe('x402 Payment Flow', () => {
  test('generates payment request correctly', async () => {
    const request = {
      amount: '0.1',
      recipient: '0x742d35Cc6634C0532925a3b8D8',
      contentId: 'content-123',
      network: 'scroll-zk'
    };

    const response = await generatePaymentRequest(request);

    expect(response.paymentId).toBeDefined();
    expect(response.paymentUrl).toContain('/pay');
    expect(response.expiresAt).toBeDefined();
  });
});
```

### Payment Monitoring
```typescript
// lib/payment-monitoring.ts
export async function trackPaymentMetrics(data: {
  paymentId: string;
  amount: string;
  processingTime: number;
  gasUsed: number;
  network: string;
  status: 'success' | 'failed';
}) {
  await analytics.track('Payment Processed', {
    paymentId: data.paymentId,
    amount: parseFloat(data.amount),
    processingTimeMs: data.processingTime,
    gasUsed: data.gasUsed,
    network: data.network,
    status: data.status,
    timestamp: new Date().toISOString()
  });
}
```

## Security Considerations

### Payment Validation
- Verify transaction amounts match payment requests
- Check recipient addresses before processing
- Validate network consistency
- Implement payment expiration to prevent replay attacks

### Error Handling
- Handle wallet connection failures gracefully
- Provide clear error messages for failed payments
- Implement retry mechanisms for network issues
- Log security events for monitoring

### Best Practices
- Never store private keys on the server
- Use secure random payment IDs
- Implement rate limiting for payment requests
- Monitor for unusual payment patterns