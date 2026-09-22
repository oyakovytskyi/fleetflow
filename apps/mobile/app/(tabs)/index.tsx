import type { DeliveryDto } from '@fleetflow/shared-types';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useDeliveries } from '@/src/features/deliveries/hooks/useDeliveries';
import { useAppConfig } from '@/src/hooks';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';
import { deliverySelected } from '@/src/store/slices/deliveriesSlice';
import { selectIsOnline } from '@/src/store/slices/networkSlice';
import {
  selectIsTracking,
  selectPendingCount,
} from '@/src/store/slices/trackingSlice';

export default function HomeScreen() {
  const { appName } = useAppConfig();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isOnline = useAppSelector(selectIsOnline);
  const isTracking = useAppSelector(selectIsTracking);
  const pendingCount = useAppSelector(selectPendingCount);
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const success = useThemeColor({}, 'success');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const { data: deliveries = [], isLoading } = useDeliveries();

  const active = deliveries.find(
    (d) => d.status === 'IN_PROGRESS' && d.driverId === user?.id,
  );
  const assigned = deliveries.find(
    (d) => d.status === 'ASSIGNED' && d.driverId === user?.id,
  );
  const pendingOpen = deliveries.filter((d) => d.status === 'PENDING').length;

  function openDelivery(delivery: DeliveryDto) {
    router.push({ pathname: '/delivery/[id]', params: { id: delivery.id } } as Href);
  }

  function openMap(delivery: DeliveryDto) {
    dispatch(deliverySelected(delivery.id));
    router.push('/(tabs)/map');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{appName}</Text>
      <Text style={[styles.subtitle, { color: muted }]}>
        {user ? `Hi, ${user.name}` : 'Driver home'}
      </Text>

      {active ? (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.cardEyebrow, { color: success }]}>Active delivery</Text>
          <Text style={styles.cardTitle}>{active.title}</Text>
          <Text style={[styles.cardMeta, { color: muted }]}>
            {isTracking ? 'GPS sharing on' : 'GPS sharing off'}
            {!isOnline ? ' · offline queue' : ''}
            {pendingCount > 0 ? ` · ${pendingCount} queued` : ''}
          </Text>
          <View style={styles.cardActions}>
            <Pressable onPress={() => openMap(active)}>
              <Text style={[styles.link, { color: tint }]}>Open map</Text>
            </Pressable>
            <Pressable onPress={() => openDelivery(active)}>
              <Text style={[styles.link, { color: tint }]}>Continue</Text>
            </Pressable>
          </View>
        </View>
      ) : assigned ? (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.cardEyebrow, { color: tint }]}>Assigned to you</Text>
          <Text style={styles.cardTitle}>{assigned.title}</Text>
          <Text style={[styles.cardMeta, { color: muted }]}>Start the job to share GPS.</Text>
          <Pressable onPress={() => openDelivery(assigned)}>
            <Text style={[styles.link, { color: tint }]}>Open delivery</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={styles.cardTitle}>
            {isLoading ? 'Loading jobs…' : pendingOpen > 0 ? `${pendingOpen} open job${pendingOpen === 1 ? '' : 's'}` : 'No open jobs'}
          </Text>
          <Text style={[styles.cardMeta, { color: muted }]}>
            {pendingOpen > 0
              ? 'Claim a delivery to get on the road.'
              : 'Ask an admin to create or assign a delivery.'}
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/deliveries')}>
            <Text style={[styles.link, { color: tint }]}>Browse deliveries</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: muted }]}>
          Network {isOnline ? 'online' : 'offline'}
          {isTracking ? ' · tracking' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  link: {
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 13,
  },
});
