import { StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useAppConfig } from '@/src/hooks';
import { useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';
import { selectIsOnline } from '@/src/store/slices/networkSlice';
import { selectConnectionStatus, selectIsTracking } from '@/src/store/slices/trackingSlice';

export default function HomeScreen() {
  const { appName, apiUrl } = useAppConfig();
  const user = useAppSelector(selectUser);
  const isOnline = useAppSelector(selectIsOnline);
  const isTracking = useAppSelector(selectIsTracking);
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{appName}</Text>
      <Text style={[styles.subtitle, { color: muted }]}>
        {user ? `Welcome, ${user.name}.` : 'Driver home — deliveries and tracking come next.'}
      </Text>

      <View style={styles.status}>
        <StatusRow label="Signed in as" value={user?.email ?? '—'} />
        <StatusRow label="Role" value={user?.role ?? '—'} />
        <StatusRow label="Network" value={isOnline ? 'online' : 'offline'} />
        <StatusRow label="Tracking" value={isTracking ? 'active' : 'idle'} />
        <StatusRow label="Socket" value={connectionStatus.toLowerCase()} />
        <StatusRow label="API" value={apiUrl} />
      </View>
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  const muted = useThemeColor({}, 'muted');
  return (
    <View style={styles.row}>
      <Text style={{ color: muted }}>{label}</Text>
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
  },
  status: {
    marginTop: 32,
    alignSelf: 'stretch',
    gap: 8,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'transparent',
  },
  rowValue: {
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});
