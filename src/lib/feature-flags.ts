const DEFAULTS: Record<string, boolean> = {
  AUDIT_LOG: true,
  API_KEYS: true,
  ADMIN_DASHBOARD: true,
}

function envKey(flag: string): string {
  return `FEATURE_${flag.toUpperCase().replace(/-/g, '_')}`
}

// toggle via FEATURE_AUDIT_LOG=true etc.
export function isFeatureEnabled(
  flag: keyof typeof DEFAULTS | string
): boolean {
  const value = process.env[envKey(flag)]
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return DEFAULTS[flag] ?? false
}
