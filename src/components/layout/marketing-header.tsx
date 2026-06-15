'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Github, Menu, Play, X } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { NAV_LINKS } from '@/lib/marketing'
import { DEMO_DASHBOARD_PATH, DOCS_URL, GITHUB_REPO } from '@/lib/site'
import { cn } from '@/lib/utils'

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="/design-system"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Design
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
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
            aria-label="Open menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          'border-t border-border bg-background lg:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
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
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            Documentation
          </Link>
          <Link
            href={DEMO_DASHBOARD_PATH}
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
          >
            Live demo
          </Link>
          <Link
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  )
}
