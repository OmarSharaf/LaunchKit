'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Github, Menu, Play, X } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { useActiveSection } from '@/hooks/use-active-section'
import { NAV_LINKS } from '@/lib/marketing'
import { DEMO_DASHBOARD_PATH, DOCS_HUB_PATH, GITHUB_REPO } from '@/lib/site'
import { cn } from '@/lib/utils'

const SECTION_IDS = NAV_LINKS.map((link) => link.href.replace('#', ''))

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeSection = useActiveSection(SECTION_IDS)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header className="glass sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.replace('#', '')
            const isActive = activeSection === sectionId
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href={DOCS_HUB_PATH}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="/design-system"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Design
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="hidden text-muted-foreground sm:inline-flex"
            asChild
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 md:inline-flex"
            asChild
          >
            <Link href={DEMO_DASHBOARD_PATH}>
              <Play className="h-3.5 w-3.5" />
              Demo
            </Link>
          </Button>
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/auth/register">Get started</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          tabIndex={-1}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        id="mobile-nav"
        className={cn(
          'relative z-50 border-t border-border bg-background shadow-lg transition-all duration-200 lg:hidden',
          mobileOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        )}
        hidden={!mobileOpen}
      >
        <nav className="container flex flex-col gap-1 py-4" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={DOCS_HUB_PATH}
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            Documentation
          </Link>
          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            Sign in
          </Link>
          <Link
            href={DEMO_DASHBOARD_PATH}
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
          >
            Live demo
          </Link>
          <Button className="mt-2 w-full" asChild>
            <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
              Get started free
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
