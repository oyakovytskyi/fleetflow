import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.subtitle}>MapView, markers, and GPS tracking come in Sprint 4–5.</Text>
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
