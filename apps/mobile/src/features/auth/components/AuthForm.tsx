import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
} from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';

type FieldProps = TextInputProps & {
  label: string;
};

export function AuthField({ label, style, ...rest }: FieldProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#d0d5dd', dark: '#333' }, 'text');
  const backgroundColor = useThemeColor({ light: '#f8fafc', dark: '#111' }, 'background');

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#98a2b3"
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color, borderColor, backgroundColor }, style]}
        {...rest}
      />
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
};

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const tint = useThemeColor({}, 'tint');

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? { backgroundColor: tint, opacity: pressed || disabled || loading ? 0.7 : 1 }
          : { opacity: pressed || disabled || loading ? 0.5 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : tint} />
      ) : (
        <Text
          style={[styles.buttonLabel, isPrimary ? styles.primaryLabel : { color: tint }]}
          lightColor={isPrimary ? '#fff' : undefined}
          darkColor={isPrimary ? '#000' : undefined}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function useAuthFormState() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    error,
    setError,
  };
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#fff',
  },
});
