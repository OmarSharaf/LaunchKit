import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${APP_NAME}.`,
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center">
          <BrandLogo />
        </div>
      </header>
      <main className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-semibold">Information we collect</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We collect account information you provide (name, email,
              organization details), usage data about how you use {APP_NAME},
              and payment information processed by{' '}
              <a
                href="https://stripe.com/privacy"
                className="text-primary hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Stripe
              </a>
              . Authentication is handled via{' '}
              <a
                href="https://supabase.com/privacy"
                className="text-primary hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Supabase Auth
              </a>
              . Transactional emails may be sent through Resend.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">How we use data</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Data is used to provide and improve {APP_NAME}, process
              subscriptions, send order notifications and team invitations,
              maintain audit logs for security, and comply with legal
              obligations. We do not sell your personal data.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Data retention</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Account data is retained while your account is active. Audit logs
              and billing records may be kept for up to seven years for
              compliance. You may request deletion of your account by contacting{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Third-party processors</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>Supabase — authentication and database hosting</li>
              <li>Stripe — payment processing and subscription management</li>
              <li>Resend — transactional email delivery</li>
              <li>Vercel (or your host) — application hosting</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Your rights</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Depending on your region (including GDPR and CCPA), you may
              request access, correction, portability, or deletion of your
              personal data. Contact {SUPPORT_EMAIL} to exercise these rights.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  )
}
