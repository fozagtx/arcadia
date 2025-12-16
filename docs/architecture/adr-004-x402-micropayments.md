# ADR-004: x402 Micropayment Protocol

## Status
Accepted

## Context
Arcadia requires a micropayment system for compensating creators instantly and cost-effectively. Traditional payment systems have high fees and settlement delays that make small payments (under $50) impractical.

## Decision
Implement x402 micropayment protocol for instant, low-cost creator compensation with the following architecture:

- **Protocol**: x402 HTTP status code based payments
- **Integration**: Direct protocol implementation in Next.js API routes
- **Wallet Support**: Connect with popular wallet providers (MetaMask, WalletConnect)
- **Payment Flow**: Instant settlement upon content delivery verification
- **Pricing Model**: Fixed fee structure transparent to both brands and creators

## Implementation Details

### x402 Payment Flow
```typescript
// /api/payments/request
export async function POST(request: Request) {
  const { creatorAddress, amount, contentId } = await request.json();

  // Generate x402 payment request
  const paymentRequest = {
    amount: amount,
    recipient: creatorAddress,
    memo: `Payment for content: ${contentId}`,
    network: 'scroll-zk'
  };

  // Return 402 Payment Required with payment details
  return new Response(JSON.stringify(paymentRequest), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Required': 'true'
    }
  });
}
```

### Payment Verification
```typescript
// /api/payments/verify
export async function POST(request: Request) {
  const { transactionHash, contentId } = await request.json();

  // Verify transaction on Scroll ZK
  const verified = await verifyTransaction(transactionHash);

  if (verified) {
    // Release content and update creator payment status
    await releaseContentToBrand(contentId);
    await updateCreatorPayment(transactionHash);
  }

  return NextResponse.json({ verified, status: 'payment_processed' });
}
```

## Protocol Benefits

### For Creators
- **Instant Payments**: Settlement in seconds, not days
- **Low Fees**: Under $0.10 per transaction regardless of amount
- **Global Access**: No geographic restrictions or banking requirements
- **Transparent**: All transactions visible on blockchain

### For Brands
- **Cost Effective**: No payment processing fees for small amounts
- **Automated**: No manual invoice processing
- **Reliable**: Cryptographic proof of payment
- **Compliance**: Immutable payment records for accounting

## Consequences

### Positive
- **Speed**: Instant settlement eliminates payment delays
- **Cost**: Dramatically lower fees than traditional payment processors
- **Transparency**: Blockchain provides immutable payment records
- **Global**: Works worldwide without banking infrastructure

### Negative
- **Adoption**: Requires crypto wallet setup from users
- **Complexity**: More complex than traditional payment flows
- **Volatility**: Cryptocurrency price fluctuations
- **Regulation**: Evolving regulatory landscape for crypto payments

## Security Considerations
- Non-custodial implementation (platform never holds private keys)
- Transaction verification through multiple confirmations
- Smart contract audit for payment logic
- Rate limiting to prevent payment spam

## Integration Timeline
1. **Phase 1**: Basic x402 implementation with MetaMask
2. **Phase 2**: WalletConnect integration for mobile wallets
3. **Phase 3**: Fiat on-ramp integration for user onboarding
4. **Phase 4**: Advanced features like payment splitting and escrow

## Monitoring Metrics
- Payment success rate (target: >99%)
- Transaction confirmation time (target: <30 seconds)
- User adoption rate for crypto payments
- Average transaction costs vs traditional payments