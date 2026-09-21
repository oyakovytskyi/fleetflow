/**
 * FleetFlow color tokens.
 * Keep `tint` brand-blue in both schemes so primary buttons stay readable.
 */
const brand = '#2563eb';

export default {
  light: {
    text: '#0f172a',
    background: '#ffffff',
    tint: brand,
    tabIconDefault: '#94a3b8',
    tabIconSelected: brand,
    muted: '#64748b',
    border: '#e2e8f0',
    surface: '#f1f5f9',
    danger: '#dc2626',
    success: '#16a34a',
    onTint: '#ffffff',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: '#3b82f6',
    tabIconDefault: '#64748b',
    tabIconSelected: '#3b82f6',
    muted: '#94a3b8',
    border: '#334155',
    surface: '#1e293b',
    danger: '#f87171',
    success: '#4ade80',
    onTint: '#ffffff',
  },
};
