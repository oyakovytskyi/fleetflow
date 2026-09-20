import { router, type Href } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { DeliveryListItem } from '@/src/features/deliveries/components/DeliveryListItem';
import { useDeliveries } from '@/src/features/deliveries/hooks/useDeliveries';

export function DeliveriesListView() {
  const { data, isLoading, isError, isRefetching, refetch, error } = useDeliveries();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Could not load deliveries.</Text>
        <Text style={styles.hint}>{error instanceof Error ? error.message : 'Try again.'}</Text>
        <Text style={styles.link} onPress={() => void refetch()}>
          Retry
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No deliveries yet</Text>
          <Text style={styles.hint}>
            Ask an admin to create a job, or pull to refresh after one is assigned.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <DeliveryListItem
          delivery={item}
          onPress={() =>
            router.push({ pathname: '/delivery/[id]', params: { id: item.id } } as Href)
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    textAlign: 'center',
    opacity: 0.65,
  },
  error: {
    color: '#d92d20',
    fontWeight: '600',
  },
  link: {
    marginTop: 8,
    fontWeight: '700',
    color: '#2f95dc',
  },
});
