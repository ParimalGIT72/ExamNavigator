'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthService } from '@/services/auth.service';

function AuthRehydrator({ children }: { children: React.ReactNode }) {
  const { token, user, setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const rehydrate = async () => {
      if (token && !user) {
        setLoading(true);
        try {
          const response = await AuthService.getCurrentUser();
          if (response.success && response.data?.user) {
            setAuth(response.data.user, token);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        } finally {
          setLoading(false);
        }
      }
    };

    rehydrate();
  }, [token, user, setAuth, logout, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthRehydrator>{children}</AuthRehydrator>
    </QueryClientProvider>
  );
}
