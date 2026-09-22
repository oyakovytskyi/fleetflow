import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** Shared TypeScript ESLint flat config for FleetFlow TS workspaces. */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.expo/**', '**/coverage/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
