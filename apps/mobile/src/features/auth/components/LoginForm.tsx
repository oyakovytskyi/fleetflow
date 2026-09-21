import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { APP_NAME } from '@/src/constants';

import { getAuthErrorMessage, useLogin } from '../hooks/useAuth';
import { AuthButton, AuthError, AuthField, useAuthFormState } from './AuthForm';

export function LoginForm() {
  const { email, setEmail, password, setPassword, error, setError } = useAuthFormState();
  const loginMutation = useLogin();
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');

  async function onSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.brand, { color: tint }]}>{APP_NAME}</Text>
      <Text style={styles.title}>Sign in</Text>
      <Text style={[styles.subtitle, { color: muted }]}>
        Driver access for deliveries and live tracking.
      </Text>

      <View style={styles.form}>
        <AuthField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="driver@example.com"
        />
        <AuthField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          placeholder="••••••••"
        />

        {error ? <AuthError message={error} /> : null}

        <AuthButton label="Sign in" onPress={onSubmit} loading={loginMutation.isPending} />
      </View>

      <AuthButton
        label="Create an account"
        variant="ghost"
        onPress={() => router.push('/(auth)/register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 20,
  },
  form: {
    gap: 14,
    backgroundColor: 'transparent',
  },
});
