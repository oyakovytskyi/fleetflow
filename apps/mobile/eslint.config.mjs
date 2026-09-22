import base from '@fleetflow/config/eslint.base.mjs';

export default [
  ...base,
  {
    files: ['app/_layout.tsx'],
    rules: {
      // Expo font loading requires a static require() for the asset.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
