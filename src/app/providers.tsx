'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SocialProvider } from '@/components/providers/SocialProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocialProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </SocialProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
