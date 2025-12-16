'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConnectors } from 'connectkit';
import { scroll, scrollSepolia } from 'wagmi/chains';

const chains = [scrollSepolia, scroll] as const;

// Create wagmi config with ConnectKit connectors
const config = createConfig({
  chains,
  connectors: getDefaultConnectors({
    app: {
      name: 'Arcadia - Veo Prompt Generator',
      description: 'AI-powered Veo 3.1 prompt generation with x402 payments',
      url: 'https://arcadia.app',
      icon: 'https://avatars.githubusercontent.com/u/37784886',
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
  }),
  transports: {
    [scroll.id]: http('https://rpc.scroll.io'),
    [scrollSepolia.id]: http('https://sepolia-rpc.scroll.io')
  },
  ssr: true,
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false
    }
  }
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          customTheme={{
            '--ck-font-family': 'Inter, sans-serif',
            '--ck-border-radius': '8px'
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { config as wagmiConfig };