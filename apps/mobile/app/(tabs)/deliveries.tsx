import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function DeliveriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliveries</Text>
      <Text style={styles.subtitle}>Assigned deliveries will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
