'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState, type ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SocialProvider } from '@/components/providers/SocialProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useDeepLink } from '@/hooks/useDeepLink';
import { useCallNotifications } from '@/hooks/useCallNotifications';
import { useKeyboardShortcuts } from '@/hooks/keyboard/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/hooks/keyboard/KeyboardShortcutsModal';

/** Resolves ?dl= deep link params into web app routes */
function DeepLinkResolver({ children }: { children: ReactNode }) {
  useDeepLink();
  return <>{children}</>;
}

/** Gap #31: Always-active call notification listener */
function CallNotificationListener({ children }: { children: ReactNode }) {
  useCallNotifications();
  return <>{children}</>;
}

/** Global keyboard shortcuts: Alt+nav, ? for help modal */
function GlobalKeyboardShortcuts({ children }: { children: ReactNode }) {
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();
  return (
    <>
      {children}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  );
}

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
            <Suspense>
              <CallNotificationListener>
                <GlobalKeyboardShortcuts>
                  <DeepLinkResolver>{children}</DeepLinkResolver>
                </GlobalKeyboardShortcuts>
              </CallNotificationListener>
            </Suspense>
          </ErrorBoundary>
        </SocialProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
