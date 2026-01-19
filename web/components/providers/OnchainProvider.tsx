'use client';

import { ReactNode, useState } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

const config = createConfig({
    chains: [base],
    connectors: [
        coinbaseWallet({
            appName: 'Prophet TV',
            preference: 'smartWalletOnly', // Force Smart Wallet for that "frictionless" feel
        }),
    ],
    transports: {
        [base.id]: http(),
    },
});

export function OnchainProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider chain={base}>
                    {children}
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
