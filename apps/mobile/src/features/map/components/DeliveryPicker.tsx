import type { DeliveryDto } from '@fleetflow/shared-types';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';

type Props = {
  deliveries: DeliveryDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DeliveryPicker({ deliveries, selectedId, onSelect }: Props) {
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  if (deliveries.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {deliveries.map((delivery) => {
          const selected = delivery.id === selectedId;
          return (
            <Pressable
              key={delivery.id}
              onPress={() => onSelect(delivery.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? tint : surface,
                  borderColor: selected ? tint : border,
                },
              ]}
            >
              <Text
                style={[styles.chipText, { color: selected ? onTint : text }]}
                numberOfLines={1}
              >
                {delivery.title}
              </Text>
              <Text style={[styles.chipStatus, { color: selected ? onTint : muted }]}>
                {delivery.status.replaceAll('_', ' ')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    maxWidth: 200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  chipStatus: {
    marginTop: 2,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
