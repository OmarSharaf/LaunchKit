'use client'

import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const
const COLORS = [
  'bg-destructive',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-emerald-600',
] as const

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getStrength(password)

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full bg-muted transition-colors',
              i < strength && COLORS[strength]
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{LABELS[strength]}</p>
    </div>
  )
}
