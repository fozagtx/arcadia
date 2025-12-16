'use client';

import { useState, useEffect, useCallback } from 'react';

interface Payment {
  paymentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  amount: string;
  currency: string;
  network: string;
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
  transactionHash?: string;
  brief?: {
    id: string;
    hook: string;
    status: string;
  };
}

interface UsePaymentStatusOptions {
  paymentId: string | null;
  pollingInterval?: number;
  maxPollingDuration?: number;
  onStatusChange?: (status: Payment['status']) => void;
  onSuccess?: (payment: Payment) => void;
  onFailure?: (payment: Payment) => void;
  onExpired?: (payment: Payment) => void;
}

interface UsePaymentStatusReturn {
  payment: Payment | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  stopPolling: () => void;
  startPolling: () => void;
  refetch: () => Promise<void>;
}

export function usePaymentStatus({
  paymentId,
  pollingInterval = 3000, // 3 seconds
  maxPollingDuration = 300000, // 5 minutes
  onStatusChange,
  onSuccess,
  onFailure,
  onExpired
}: UsePaymentStatusOptions): UsePaymentStatusReturn {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  // Fetch payment status
  const fetchPaymentStatus = useCallback(async () => {
    if (!paymentId) return;

    try {
      setError(null);
      const response = await fetch(`/api/payments/request?paymentId=${paymentId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const paymentData: Payment = await response.json();

      // Update payment state
      const previousStatus = payment?.status;
      setPayment(paymentData);

      // Trigger status change callback
      if (previousStatus && previousStatus !== paymentData.status) {
        onStatusChange?.(paymentData.status);
      }

      // Handle terminal states
      switch (paymentData.status) {
        case 'COMPLETED':
          setIsPolling(false);
          onSuccess?.(paymentData);
          break;
        case 'FAILED':
          setIsPolling(false);
          onFailure?.(paymentData);
          break;
        case 'EXPIRED':
          setIsPolling(false);
          onExpired?.(paymentData);
          break;
      }

      return paymentData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Payment status fetch error:', err);
      throw err;
    }
  }, [paymentId, payment?.status, onStatusChange, onSuccess, onFailure, onExpired]);

  // Manual refetch
  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchPaymentStatus();
    } finally {
      setIsLoading(false);
    }
  }, [fetchPaymentStatus]);

  // Start polling
  const startPolling = useCallback(() => {
    if (!paymentId || isPolling) return;

    setIsPolling(true);
    setPollingStartTime(Date.now());
  }, [paymentId, isPolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setPollingStartTime(null);
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPolling || !paymentId) return;

    const poll = async () => {
      // Check if max polling duration exceeded
      if (pollingStartTime && Date.now() - pollingStartTime > maxPollingDuration) {
        setIsPolling(false);
        setError('Polling timeout - payment status check stopped');
        return;
      }

      // Check if payment is in terminal state
      if (payment?.status && ['COMPLETED', 'FAILED', 'EXPIRED'].includes(payment.status)) {
        setIsPolling(false);
        return;
      }

      try {
        await fetchPaymentStatus();
      } catch (err) {
        // Continue polling on error, but log it
        console.warn('Payment polling error (continuing):', err);
      }
    };

    // Initial fetch
    poll();

    // Set up polling interval
    const intervalId = setInterval(poll, pollingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    isPolling,
    paymentId,
    pollingInterval,
    maxPollingDuration,
    pollingStartTime,
    payment?.status,
    fetchPaymentStatus
  ]);

  // Initial fetch when paymentId changes
  useEffect(() => {
    if (paymentId && !payment) {
      refetch();
    }
  }, [paymentId, payment, refetch]);

  // Auto-start polling for pending payments
  useEffect(() => {
    if (payment?.status === 'PENDING' || payment?.status === 'PROCESSING') {
      startPolling();
    }
  }, [payment?.status, startPolling]);

  return {
    payment,
    isLoading,
    error,
    isPolling,
    stopPolling,
    startPolling,
    refetch
  };
}