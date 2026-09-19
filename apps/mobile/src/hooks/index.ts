/**
 * Cross-feature hooks only. Feature hooks: src/features/<name>/hooks.
 */

import { env } from '@/src/config/env';
import { APP_NAME } from '@/src/constants';

export function useAppConfig() {
  return {
    appName: APP_NAME,
    apiUrl: env.apiUrl,
    isDev: env.isDev,
  };
}
