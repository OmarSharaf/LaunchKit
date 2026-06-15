export type ThemePreset = 'default' | 'ocean' | 'violet' | 'emerald'

export const THEME_PRESETS: {
  id: ThemePreset
  label: string
  description: string
}[] = [
  {
    id: 'default',
    label: 'Launch Kit Blue',
    description: 'Default brand palette',
  },
  { id: 'ocean', label: 'Ocean', description: 'Teal & cyan accents' },
  { id: 'violet', label: 'Violet', description: 'Purple product feel' },
  { id: 'emerald', label: 'Emerald', description: 'Green growth tone' },
]

const VALID_THEME_PRESETS = new Set<ThemePreset>([
  'default',
  'ocean',
  'violet',
  'emerald',
])

function resolveThemePreset(raw: string | undefined): ThemePreset {
  if (raw && VALID_THEME_PRESETS.has(raw as ThemePreset)) {
    return raw as ThemePreset
  }
  return 'default'
}

export const DEFAULT_THEME_PRESET: ThemePreset = resolveThemePreset(
  process.env.NEXT_PUBLIC_THEME_PRESET
)
