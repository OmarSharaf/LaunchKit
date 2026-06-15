'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { THEME_PRESETS, type ThemePreset } from '@/lib/theme-presets'
import { cn } from '@/lib/utils'

export function MarketingThemePreview() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [preset, setPreset] = useState<ThemePreset>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-preset', preset)
  }, [preset])

  if (!mounted) return null

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark'

  return (
    <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:justify-center">
      <p className="text-xs font-medium text-muted-foreground">Preview theme</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              preset === p.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
        {isDark ? 'Light' : 'Dark'}
      </Button>
    </div>
  )
}
