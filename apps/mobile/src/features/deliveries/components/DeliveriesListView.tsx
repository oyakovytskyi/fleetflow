import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { DeliveryListItem } from '@/src/features/deliveries/components/DeliveryListItem';
import { useDeliveries } from '@/src/features/deliveries/hooks/useDeliveries';

const STATUS_ORDER = {
  IN_PROGRESS: 0,
  ASSIGNED: 1,
  PENDING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
} as const;

export function DeliveriesListView() {
  const { data, isLoading, isError, isRefetching, refetch, error } = useDeliveries();
  const danger = useThemeColor({}, 'danger');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  const sorted = useMemo(() => {
    const list = [...(data ?? [])];
    list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    return list;
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.error, { color: danger }]}>Could not load deliveries.</Text>
        <Text style={[styles.hint, { color: muted }]}>
          {error instanceof Error ? error.message : 'Try again.'}
        </Text>
        <Text style={[styles.link, { color: tint }]} onPress={() => void refetch()}>
          Retry
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={tint} />
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No deliveries yet</Text>
          <Text style={[styles.hint, { color: muted }]}>
            When an operator creates a job, it will show up here.
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
  },
  error: {
    fontWeight: '600',
  },
  link: {
    marginTop: 8,
    fontWeight: '700',
  },
});
