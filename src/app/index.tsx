import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/user-store';

export default function Index() {
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const isLoading = useUserStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A9EFF" />
      </View>
    );
  }

  if (hasOnboarded) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
