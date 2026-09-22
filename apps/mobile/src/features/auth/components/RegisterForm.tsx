import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { APP_NAME } from '@/src/constants';

import { getAuthErrorMessage, useRegister } from '../hooks/useAuth';
import { AuthButton, AuthError, AuthField, useAuthFormState } from './AuthForm';

export function RegisterForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    error,
    setError,
  } = useAuthFormState();
  const registerMutation = useRegister();
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');

  async function onSubmit() {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
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
      <Text style={styles.title}>Create account</Text>
      <Text style={[styles.subtitle, { color: muted }]}>
        Create a driver account to take deliveries.
      </Text>

      <View style={styles.form}>
        <AuthField
          label="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
          autoComplete="name"
          placeholder="Your name"
        />
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
          textContentType="newPassword"
          autoComplete="password-new"
          placeholder="At least 8 characters"
        />

        {error ? <AuthError message={error} /> : null}

        <AuthButton
          label="Create account"
          onPress={onSubmit}
          loading={registerMutation.isPending}
        />
      </View>

      <AuthButton
        label="Already have an account? Sign in"
        variant="ghost"
        onPress={() => router.push('/(auth)/login')}
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
