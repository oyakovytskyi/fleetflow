import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAppConfig } from '@/src/hooks';
import { useAppSelector } from '@/src/store/hooks';
import { selectIsAuthenticated } from '@/src/store/slices/authSlice';
import { selectIsOnline } from '@/src/store/slices/networkSlice';
import { selectConnectionStatus, selectIsTracking } from '@/src/store/slices/trackingSlice';

export default function HomeScreen() {
  const { appName, apiUrl } = useAppConfig();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOnline = useAppSelector(selectIsOnline);
  const isTracking = useAppSelector(selectIsTracking);
  const connectionStatus = useAppSelector(selectConnectionStatus);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{appName}</Text>
      <Text style={styles.subtitle}>Driver home — deliveries and tracking come next.</Text>

      <View style={styles.status}>
        <StatusRow label="Session" value={isAuthenticated ? 'signed in' : 'signed out'} />
        <StatusRow label="Network" value={isOnline ? 'online' : 'offline'} />
        <StatusRow label="Tracking" value={isTracking ? 'active' : 'idle'} />
        <StatusRow label="Socket" value={connectionStatus.toLowerCase()} />
        <StatusRow label="API" value={apiUrl} />
      </View>
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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
  status: {
    marginTop: 32,
    alignSelf: 'stretch',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLabel: {
    opacity: 0.6,
  },
  rowValue: {
    fontWeight: '600',
    flexShrink: 1,
  },
});
