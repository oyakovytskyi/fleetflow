import type { DeliveryDto } from '@fleetflow/shared-types';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

type Props = {
  deliveries: DeliveryDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DeliveryPicker({ deliveries, selectedId, onSelect }: Props) {
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
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
                numberOfLines={1}
              >
                {delivery.title}
              </Text>
              <Text style={[styles.chipStatus, selected && styles.chipTextSelected]}>
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
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#d0d5dd',
  },
  chipSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  chipStatus: {
    marginTop: 2,
    fontSize: 11,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  chipTextSelected: {
    color: '#fff',
    opacity: 1,
  },
});
