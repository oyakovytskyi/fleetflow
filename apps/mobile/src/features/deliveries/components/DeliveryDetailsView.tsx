import type { DeliveryDto } from '@fleetflow/shared-types';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { AuthButton, AuthError } from '@/src/features/auth/components/AuthForm';
import { getAuthErrorMessage } from '@/src/features/auth/hooks/useAuth';
import {
  useClaimDelivery,
  useCompleteDelivery,
  useStartDelivery,
} from '@/src/features/deliveries/hooks/useDeliveries';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';
import { deliverySelected } from '@/src/store/slices/deliveriesSlice';

type Props = {
  delivery: DeliveryDto;
};

export function DeliveryDetailsView({ delivery }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const muted = useThemeColor({}, 'muted');
  const claim = useClaimDelivery();
  const start = useStartDelivery();
  const complete = useCompleteDelivery();
  const [error, setError] = useState<string | null>(null);

  const busy = claim.isPending || start.isPending || complete.isPending;
  const isMine = user?.id === delivery.driverId;

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  function openOnMap() {
    dispatch(deliverySelected(delivery.id));
    router.push('/(tabs)/map');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{delivery.title}</Text>
      <Text style={[styles.status, { color: muted }]}>
        {delivery.status.replaceAll('_', ' ')}
      </Text>

      {delivery.description ? (
        <Text style={[styles.body, { color: muted }]}>{delivery.description}</Text>
      ) : null}

      <View style={styles.meta}>
        <Meta
          label="Pickup"
          value={`${delivery.pickupLatitude.toFixed(4)}, ${delivery.pickupLongitude.toFixed(4)}`}
        />
        <Meta
          label="Destination"
          value={`${delivery.destinationLatitude.toFixed(4)}, ${delivery.destinationLongitude.toFixed(4)}`}
        />
      </View>

      {error ? <AuthError message={error} /> : null}

      <View style={styles.actions}>
        <AuthButton label="View on map" variant="ghost" onPress={openOnMap} />

        {delivery.status === 'PENDING' ? (
          <AuthButton
            label="Claim delivery"
            loading={busy}
            onPress={() => run(() => claim.mutateAsync(delivery.id))}
          />
        ) : null}

        {delivery.status === 'ASSIGNED' && isMine ? (
          <AuthButton
            label="Start delivery"
            loading={busy}
            onPress={() => run(() => start.mutateAsync(delivery.id))}
          />
        ) : null}

        {delivery.status === 'IN_PROGRESS' && isMine ? (
          <AuthButton
            label="Mark completed"
            loading={busy}
            onPress={() => run(() => complete.mutateAsync(delivery.id))}
          />
        ) : null}

        {busy ? <ActivityIndicator /> : null}
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const muted = useThemeColor({}, 'muted');
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: muted }]}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    marginTop: 8,
    gap: 8,
    backgroundColor: 'transparent',
  },
  metaRow: {
    gap: 2,
    backgroundColor: 'transparent',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
  },
  actions: {
    marginTop: 24,
    gap: 12,
    backgroundColor: 'transparent',
  },
});
