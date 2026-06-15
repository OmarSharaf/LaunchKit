import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FOOTER_LINKS } from '@/lib/marketing'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/site'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-muted/20 to-muted/40">
      <div className="container py-12 md:py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-border/80 bg-card/50 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Ready to ship?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try the demo, read the docs, or create a free account.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">Live demo</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs">Docs</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {APP_DESCRIPTION}
            </p>
            <p className="mt-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Sign in to your account
              </Link>
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Connect</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {FOOTER_LINKS.connect.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  label,
  external,
}: {
  href: string
  label: string
  external?: boolean
}) {
  const className = 'transition-colors hover:text-foreground'
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}
