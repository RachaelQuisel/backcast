import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface ErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

export default function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        The app hit an unexpected error. Your data is safe.
      </Text>

      <Pressable style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>

      <Pressable style={styles.homeButton} onPress={() => router.replace('/')}>
        <Text style={styles.homeText}>Go home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#4A9EFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  homeText: {
    fontSize: 14,
    color: '#666',
  },
});
