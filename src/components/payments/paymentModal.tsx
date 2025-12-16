'use client';

import { useState } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, AlertCircle, Loader2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentTier {
  id: 'basic_prompt' | 'premium_prompt' | 'enterprise_prompt';
  name: string;
  description: string;
  price: string;
  priceUsd: string;
  features: string[];
  popular?: boolean;
}

const PAYMENT_TIERS: PaymentTier[] = [
  {
    id: 'basic_prompt',
    name: 'Basic Prompt',
    description: 'Standard Veo 3.1 prompt generation',
    price: '0.005',
    priceUsd: '~$12',
    features: [
      'AI-optimized video prompt',
      'Technical specifications',
      'Basic quality scoring',
      'Standard delivery time'
    ]
  },
  {
    id: 'premium_prompt',
    name: 'Premium Prompt',
    description: 'Enhanced prompt with multiple variants',
    price: '0.01',
    priceUsd: '~$24',
    features: [
      'Everything in Basic',
      'Multiple prompt variants',
      'Advanced quality scoring',
      'Detailed optimization tips',
      'Priority generation'
    ],
    popular: true
  },
  {
    id: 'enterprise_prompt',
    name: 'Enterprise Prompt',
    description: 'Professional-grade prompt suite',
    price: '0.025',
    priceUsd: '~$60',
    features: [
      'Everything in Premium',
      'Brand-specific optimization',
      'Custom quality frameworks',
      'Extended prompt variations',
      'Dedicated support'
    ]
  }
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentId: string) => void;
  brandId: string;
  briefId?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  brandId,
  briefId
}: PaymentModalProps) {
  const [selectedTier, setSelectedTier] = useState<PaymentTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const {
    sendTransaction,
    data: hash,
    isPending: isSending,
    error: sendError
  } = useSendTransaction();

  const {
    isLoading: isWaitingForReceipt,
    isSuccess: isReceiptSuccess
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Create payment request
  const createPaymentRequest = async (tier: PaymentTier) => {
    try {
      const response = await fetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId,
          briefId,
          promptType: tier.id,
          memo: `Veo prompt generation - ${tier.name}`,
          callbackUrl: window.location.origin + '/payment/success'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment request');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment request error:', error);
      throw error;
    }
  };

  // Handle payment
  const handlePayment = async (tier: PaymentTier) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setSelectedTier(tier);

    try {
      // Create payment request
      const paymentData = await createPaymentRequest(tier);
      setPaymentId(paymentData.paymentId);

      // Send transaction
      sendTransaction({
        to: process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS as `0x${string}`,
        value: parseEther(tier.price),
        data: `0x${Buffer.from(JSON.stringify({
          paymentId: paymentData.paymentId,
          service: 'veo-prompt-generation'
        })).toString('hex')}`
      });

      toast.success('Transaction sent! Please wait for confirmation...');

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle successful transaction
  if (isReceiptSuccess && paymentId) {
    toast.success('Payment confirmed! Generating your Veo prompt...');
    onPaymentSuccess(paymentId);
    onClose();
  }

  // Handle transaction errors
  if (sendError) {
    toast.error(`Transaction failed: ${sendError.message}`);
    setIsProcessing(false);
  }

  const isTransactionPending = isSending || isWaitingForReceipt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Your Veo Prompt Generation Tier
          </DialogTitle>
          <DialogDescription>
            Select a payment tier to generate AI-optimized Veo 3.1 video prompts for your advertising campaign
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Wallet Not Connected
              </h3>
              <p className="text-amber-700 mb-4">
                Please connect your Web3 wallet to proceed with payment
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Balance Display */}
            {balance && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Wallet Balance:
                  </span>
                  <span className="font-semibold">
                    {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Payment Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAYMENT_TIERS.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    tier.popular
                      ? 'border-primary shadow-lg scale-105'
                      : 'hover:border-primary/50 hover:shadow-md'
                  } ${
                    selectedTier?.id === tier.id
                      ? 'border-primary shadow-lg'
                      : ''
                  }`}
                  onClick={() => !isTransactionPending && setSelectedTier(tier)}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-2 left-4 bg-primary">
                      Popular
                    </Badge>
                  )}

                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tier.description}
                      </p>
                      <div className="text-2xl font-bold">
                        {tier.price} ETH
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tier.priceUsd}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full mt-6"
                      variant={selectedTier?.id === tier.id ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment(tier);
                      }}
                      disabled={!isConnected || isTransactionPending}
                    >
                      {isTransactionPending && selectedTier?.id === tier.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${tier.price} ETH`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transaction Status */}
            {isTransactionPending && selectedTier && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    {isSending ? (
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    ) : (
                      <Clock className="h-6 w-6 text-blue-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        {isSending ? 'Sending Transaction...' : 'Waiting for Confirmation...'}
                      </h3>
                      <p className="text-sm text-blue-700">
                        {isSending
                          ? 'Please confirm the transaction in your wallet'
                          : 'Transaction sent! Waiting for blockchain confirmation...'
                        }
                      </p>
                      {hash && (
                        <p className="text-xs text-blue-600 mt-1 font-mono">
                          Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Footer Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Payments are processed on Scroll network for fast and low-cost transactions
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}