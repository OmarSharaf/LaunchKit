import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { AUTH_PANEL } from '@/lib/marketing-content'
import { APP_DESCRIPTION, APP_NAME, DEMO_DASHBOARD_PATH } from '@/lib/site'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-violet-600 p-10 text-primary-foreground lg:flex lg:w-[45%] xl:w-[42%]">
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"
          aria-hidden
        />
        <div className="relative">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-primary-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {AUTH_PANEL.eyebrow}
            </span>
          </Link>
        </div>
        <blockquote className="relative max-w-md">
          <p className="text-2xl font-semibold leading-snug tracking-tight">
            &ldquo;{AUTH_PANEL.quote(APP_NAME)}&rdquo;
          </p>
          <footer className="mt-6 text-sm text-primary-foreground/80">
            {AUTH_PANEL.footer}
          </footer>
        </blockquote>
        <p className="relative text-sm text-primary-foreground/70">
          {APP_DESCRIPTION}
        </p>
        <div className="relative flex flex-wrap gap-3 text-sm">
          <Link
            href={DEMO_DASHBOARD_PATH}
            className="rounded-lg bg-white/10 px-3 py-2 font-medium transition-colors hover:bg-white/20"
          >
            View live demo
          </Link>
          <Link
            href="/#pricing"
            className="rounded-lg bg-white/10 px-3 py-2 font-medium transition-colors hover:bg-white/20"
          >
            Compare plans
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 lg:border-none lg:px-10">
          <BrandLogo className="lg:hidden" />
          <div className="ml-auto flex items-center gap-3">
            <Link
              href={DEMO_DASHBOARD_PATH}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Live demo
            </Link>
            <ThemeToggle />
            <Link
              href="/"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              ← Back to home
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
