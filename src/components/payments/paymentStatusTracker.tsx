'use client';

import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStatusTrackerProps {
  paymentId: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  className?: string;
}

export function PaymentStatusTracker({
  paymentId,
  onSuccess,
  onFailure,
  className
}: PaymentStatusTrackerProps) {
  const {
    payment,
    isLoading,
    error,
    isPolling,
    stopPolling,
    startPolling,
    refetch
  } = usePaymentStatus({
    paymentId,
    pollingInterval: 3000,
    maxPollingDuration: 300000, // 5 minutes
    onStatusChange: (status) => {
      switch (status) {
        case 'PROCESSING':
          toast.info('Payment processing on blockchain...');
          break;
        case 'COMPLETED':
          toast.success('Payment confirmed! Generating your Veo prompt...');
          break;
        case 'FAILED':
          toast.error('Payment failed. Please try again.');
          break;
        case 'EXPIRED':
          toast.warning('Payment expired. Please create a new payment.');
          break;
      }
    },
    onSuccess: () => onSuccess?.(),
    onFailure: () => onFailure?.()
  });

  if (isLoading && !payment) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading payment status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h3 className="font-semibold text-destructive">Error Loading Payment</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!payment) return null;

  // Status configuration
  const statusConfig = {
    PENDING: {
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      progress: 25
    },
    PROCESSING: {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      progress: 75
    },
    COMPLETED: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      progress: 100
    },
    FAILED: {
      icon: <XCircle className="h-5 w-5" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      progress: 0
    },
    EXPIRED: {
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      progress: 0
    }
  };

  const config = statusConfig[payment.status];

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!payment.expiresAt) return null;
    const now = Date.now();
    const expires = new Date(payment.expiresAt).getTime();
    const remaining = expires - now;

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Card className={`${config.borderColor} ${config.bgColor} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {config.icon}
            Payment Status
          </CardTitle>
          <Badge variant="outline" className={`${config.color} text-white`}>
            {payment.status.toLowerCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className={config.textColor}>{config.progress}%</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>

        <Separator />

        {/* Payment Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID:</span>
            <span className="font-mono text-xs">
              {payment.paymentId.slice(0, 8)}...{payment.paymentId.slice(-8)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">
              {payment.amount} {payment.currency}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="capitalize">{payment.network}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(payment.createdAt)}</span>
          </div>

          {payment.status === 'PENDING' && timeRemaining && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires in:</span>
              <span className={timeRemaining === 'Expired' ? 'text-destructive' : 'text-warning'}>
                {timeRemaining}
              </span>
            </div>
          )}

          {payment.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed:</span>
              <span>{formatDate(payment.completedAt)}</span>
            </div>
          )}

          {payment.transactionHash && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => {
                  const explorerUrl = payment.network.includes('scroll')
                    ? 'https://sepolia.scrollscan.com'
                    : 'https://scrollscan.com';
                  window.open(`${explorerUrl}/tx/${payment.transactionHash}`, '_blank');
                }}
              >
                <span className="font-mono text-xs mr-1">
                  {payment.transactionHash.slice(0, 6)}...{payment.transactionHash.slice(-4)}
                </span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Brief Status */}
        {payment.brief && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Veo Prompt Status:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {payment.brief.status}
                </Badge>
              </div>
              {payment.brief.hook && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {payment.brief.hook.slice(0, 100)}...
                </p>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isPolling ? (
            <Button onClick={stopPolling} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Stop Monitoring
            </Button>
          ) : (
            ['PENDING', 'PROCESSING'].includes(payment.status) && (
              <Button onClick={startPolling} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resume Monitoring
              </Button>
            )
          )}

          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}