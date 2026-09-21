import { StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { AuthButton } from '@/src/features/auth/components/AuthForm';
import { useLogout } from '@/src/features/auth/hooks/useAuth';
import { useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';

export default function ProfileScreen() {
  const user = useAppSelector(selectUser);
  const logoutMutation = useLogout();
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {user ? (
        <View style={styles.card}>
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role} />
        </View>
      ) : (
        <Text style={{ color: muted }}>Not signed in.</Text>
      )}

      <AuthButton
        label="Sign out"
        onPress={() => logoutMutation.mutate()}
        loading={logoutMutation.isPending}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    gap: 10,
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
