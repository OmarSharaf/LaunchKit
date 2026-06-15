import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { Badge } from '@/components/ui/badge'
import { getPlanNameFromSlug } from '@/lib/plan-selection'
import { APP_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Create Account',
  description: `Create your ${APP_NAME} account and start building.`,
}

interface RegisterPageProps {
  searchParams: Promise<{ plan?: string }>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { plan: planSlug } = await searchParams
  const selectedPlan = getPlanNameFromSlug(planSlug)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Start your 14-day free trial. No credit card required.
        </p>
        {selectedPlan && (
          <div className="mt-2 flex justify-center">
            <Badge variant="secondary">Selected plan: {selectedPlan}</Badge>
          </div>
        )}
      </div>

      <RegisterForm planSlug={planSlug ?? null} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{' '}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
