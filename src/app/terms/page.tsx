import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of service for ${APP_NAME}.`,
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center">
          <BrandLogo />
        </div>
      </header>
      <main className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
          <p className="leading-relaxed text-muted-foreground">
            These terms govern your use of {APP_NAME}. By creating an account or
            using the service, you agree to these terms. Have your legal counsel
            review before launching to customers.
          </p>
          <h2 className="mt-8 text-xl font-semibold">Use of service</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You may use {APP_NAME} only for lawful business purposes. You are
            responsible for your account credentials, all activity under your
            organization, and ensuring team members comply with these terms.
          </p>
          <h2 className="mt-8 text-xl font-semibold">
            Subscriptions & billing
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Paid plans are billed in advance through Stripe. You may cancel at
            any time from the billing portal; access continues until the end of
            the current billing period. Refunds are handled at our discretion
            unless required by law. Price changes will be communicated with
            reasonable notice.
          </p>
          <h2 className="mt-8 text-xl font-semibold">Data & privacy</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our collection and use of personal data is described in our{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            . You retain ownership of your organization&apos;s data; we process
            it only to provide the service.
          </p>
          <h2 className="mt-8 text-xl font-semibold">
            Limitation of liability
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {APP_NAME} is provided &quot;as is&quot; without warranties. We are
            not liable for indirect, incidental, or consequential damages
            arising from use of the service, including missed orders or catering
            delays caused by third-party providers.
          </p>
          <h2 className="mt-8 text-xl font-semibold">Contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Questions about these terms? Email{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
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
