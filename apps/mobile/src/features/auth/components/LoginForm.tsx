import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { APP_NAME } from '@/src/constants';

import { getAuthErrorMessage, useLogin } from '../hooks/useAuth';
import { AuthButton, AuthField, useAuthFormState } from './AuthForm';

export function LoginForm() {
  const { email, setEmail, password, setPassword, error, setError } = useAuthFormState();
  const loginMutation = useLogin();

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
      <Text style={styles.brand}>{APP_NAME}</Text>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Driver access for deliveries and live tracking.</Text>

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
    opacity: 0.55,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 20,
    opacity: 0.65,
  },
  form: {
    gap: 14,
  },
  error: {
    color: '#d92d20',
    fontSize: 14,
  },
});
