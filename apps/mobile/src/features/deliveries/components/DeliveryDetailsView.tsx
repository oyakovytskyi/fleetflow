import type { DeliveryDto } from '@fleetflow/shared-types';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AuthButton } from '@/src/features/auth/components/AuthForm';
import { getAuthErrorMessage } from '@/src/features/auth/hooks/useAuth';
import {
  useClaimDelivery,
  useCompleteDelivery,
  useStartDelivery,
} from '@/src/features/deliveries/hooks/useDeliveries';
import { useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';

type Props = {
  delivery: DeliveryDto;
};

export function DeliveryDetailsView({ delivery }: Props) {
  const user = useAppSelector(selectUser);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{delivery.title}</Text>
      <Text style={styles.status}>{delivery.status.replaceAll('_', ' ')}</Text>

      {delivery.description ? <Text style={styles.body}>{delivery.description}</Text> : null}

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
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
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
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
    opacity: 0.55,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  meta: {
    marginTop: 8,
    gap: 8,
  },
  metaRow: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 12,
    opacity: 0.55,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  error: {
    color: '#d92d20',
    fontSize: 14,
  },
});
