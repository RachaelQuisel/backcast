import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '@/store/user-store';
import { Analytics } from '@vercel/analytics/react';

export { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout() {
  const initialize = useUserStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0F' },
          animation: 'slide_from_right',
        }}
      />
      <Analytics />
    </>
  );
}
