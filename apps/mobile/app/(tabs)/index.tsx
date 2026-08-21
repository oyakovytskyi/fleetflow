import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { APP_NAME } from '@/src/constants';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>Driver home — deliveries and tracking come next.</Text>
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
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
