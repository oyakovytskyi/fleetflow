/**
 * Cross-feature hooks only. Feature hooks: src/features/<name>/hooks.
 */

export function useAppConfig() {
  return {
    appName: 'FleetFlow' as const,
  };
}
