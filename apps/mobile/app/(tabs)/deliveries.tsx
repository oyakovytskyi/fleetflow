import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { DeliveriesListView } from '@/src/features/deliveries/components/DeliveriesListView';

export default function DeliveriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Deliveries</Text>
      <DeliveriesListView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
