'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WagmiProvider } from 'wagmi';
import { Toaster } from "sonner";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { config } from "@/lib/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/lib/graphql";

const httpLink = createHttpLink({
  uri: 'https://prod.base.intuition-api.com/v1/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'wss://prod.base.intuition-api.com/v1/graphql',
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname() ?? '/';
  const isHome = pathname === '/';

  useEffect(() => {
    const bodyClasses = document.body.classList;
    if (isHome) {
      bodyClasses.add('home');
    } else {
      bodyClasses.remove('home');
    }
  }, [isHome]);

  return (
    <>
      <Toaster position="top-center" />
      <SessionProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ApolloProvider client={client}>
              {props.children}
            </ApolloProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
      <div className="
        -z-1
        pointer-events-none 
        h-[50vh]
        absolute 
        inset-0 
        bg-[url('/grain.png')] 
        bg-[length:128px] 
        bg-repeat 
        opacity-[0.04]
        mask-[linear-gradient(to_bottom,black,transparent)]
      "/>
    </>
  )
}