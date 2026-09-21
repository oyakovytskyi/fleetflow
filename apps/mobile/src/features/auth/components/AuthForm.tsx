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
  const muted = useThemeColor({}, 'muted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'surface');

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={muted}
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
  const onTint = useThemeColor({}, 'onTint');

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? { backgroundColor: tint, opacity: pressed || disabled || loading ? 0.75 : 1 }
          : {
              backgroundColor: 'transparent',
              opacity: pressed || disabled || loading ? 0.55 : 1,
            },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? onTint : tint} />
      ) : (
        <Text style={[styles.buttonLabel, { color: isPrimary ? onTint : tint }]}>{label}</Text>
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

/** Shared danger text for form errors. */
export function AuthError({ message }: { message: string }) {
  const danger = useThemeColor({}, 'danger');
  return <Text style={[styles.error, { color: danger }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
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
  error: {
    fontSize: 14,
  },
});
