import type { DeliveryDto, DeliveryStatus } from '@fleetflow/shared-types';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {delivery.title}
        </Text>
        <Text style={styles.badge}>{STATUS_LABEL[delivery.status]}</Text>
      </View>
      {delivery.description ? (
        <Text style={styles.description} numberOfLines={2}>
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
    borderBottomColor: '#d0d5dd',
    gap: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.65,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    opacity: 0.65,
  },
});
