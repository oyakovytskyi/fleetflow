import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { DeliveryDetailsView } from '@/src/features/deliveries/components/DeliveryDetailsView';
import { useDelivery } from '@/src/features/deliveries/hooks/useDeliveries';

export default function DeliveryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const deliveryId = typeof id === 'string' ? id : id?.[0] ?? '';
  const { data, isLoading, isError, refetch } = useDelivery(deliveryId);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Delivery' }} />

      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backLabel}>← Back</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : null}

      {isError ? (
        <View style={styles.centered}>
          <Text style={styles.error}>Could not load this delivery.</Text>
          <Text style={styles.link} onPress={() => void refetch()}>
            Retry
          </Text>
        </View>
      ) : null}

      {data ? <DeliveryDetailsView delivery={data} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  back: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f95dc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  error: {
    color: '#d92d20',
    fontWeight: '600',
  },
  link: {
    fontWeight: '700',
    color: '#2f95dc',
  },
});
