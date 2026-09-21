import type { DeliveryDto, DeliveryStatus } from '@fleetflow/shared-types';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: 'Available',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

type Props = {
  delivery: DeliveryDto;
  onPress: () => void;
};

export function DeliveryListItem({ delivery, onPress }: Props) {
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderBottomColor: border }, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {delivery.title}
        </Text>
        <Text style={[styles.badge, { color: muted }]}>{STATUS_LABEL[delivery.status]}</Text>
      </View>
      {delivery.description ? (
        <Text style={[styles.description, { color: muted }]} numberOfLines={2}>
          {delivery.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
  },
});
