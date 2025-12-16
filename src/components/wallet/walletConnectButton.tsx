'use client';

import { ConnectKitButton } from 'connectkit';
import { Button } from '@/components/ui/button';

interface WalletConnectButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function WalletConnectButton({
  className,
  variant = 'default',
  size = 'default',
}: WalletConnectButtonProps) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <Button
            onClick={show}
            variant={variant}
            size={size}
            className={className}
          >
            {isConnected ? ensName ?? truncatedAddress : 'Connect Wallet'}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}