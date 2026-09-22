import base from '@fleetflow/config/eslint.base.mjs';

export default [
  ...base,
  {
    ignores: ['next-env.d.ts', '.next/**'],
  },
];
