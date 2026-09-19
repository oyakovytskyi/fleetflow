import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AuthButton } from '@/src/features/auth/components/AuthForm';
import { useLogout } from '@/src/features/auth/hooks/useAuth';
import { useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';

export default function ProfileScreen() {
  const user = useAppSelector(selectUser);
  const logoutMutation = useLogout();

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
        <Text style={styles.subtitle}>Not signed in.</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    opacity: 0.7,
  },
  card: {
    gap: 10,
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
    textAlign: 'right',
  },
});
