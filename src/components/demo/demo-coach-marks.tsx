'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GITHUB_REPO } from '@/lib/site'

const STEPS = [
  {
    title: 'Explore the dashboard shell',
    body: 'Sidebar navigation, metrics, and activity feed mirror the real authenticated app.',
  },
  {
    title: 'Billing & team are wired',
    body: 'Stripe, PayPal, and Whop routes are included — customize plans in prisma/seed.ts.',
  },
  {
    title: 'Fork and customize',
    body: 'Edit src/lib/demo-data.ts for mock content and docs/CUSTOMIZATION.md for branding.',
  },
] as const

const STORAGE_KEY = 'launchkit-demo-tour-dismissed'

export function DemoCoachMarks() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-primary/30 bg-card p-4 shadow-xl md:bottom-6 md:left-auto md:right-6"
      role="dialog"
      aria-labelledby="demo-tour-title"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-primary">
          Demo tour · {step + 1}/{STEPS.length}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Dismiss tour"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <h2 id="demo-tour-title" className="font-semibold">
        {current.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{current.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {!isLast ? (
          <Button size="sm" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </Link>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={dismiss}>
          {isLast ? 'Got it' : 'Skip tour'}
        </Button>
      </div>
    </div>
  )
}
