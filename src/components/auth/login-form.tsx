'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AUTH_CALLBACK_URL } from '@/lib/site'
import { signInSchema, type SignInInput } from '@/lib/validations'
import { getSafeRedirectPath } from '@/lib/safe-redirect'

function LoginFormFallback() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading sign-in form"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <div className="h-10 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-4 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
      <div className="h-10 animate-pulse rounded-md bg-muted" />
    </div>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormContent />
    </Suspense>
  )
}

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // middleware sets ?redirectTo= when someone hits /dashboard while logged out
  const redirectTo = getSafeRedirectPath(searchParams.get('redirectTo'))
  const authError = searchParams.get('error')
  const authMessage = searchParams.get('message')
  const [showPassword, setShowPassword] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(
    null
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const supabase = createClient()

  async function onSubmit(data: SignInInput) {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      // Supabase message is a bit terse — friendlier copy for wrong password
      setError('root', {
        message:
          error.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please try again.'
            : error.message,
      })
      return
    }

    router.push(redirectTo)
    router.refresh() // server components need a refresh to see the new cookie
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${AUTH_CALLBACK_URL}?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    if (error) {
      setOauthLoading(null)
      setError('root', { message: error.message })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <OAuthButtons
        onGoogle={() => signInWithOAuth('google')}
        onGithub={() => signInWithOAuth('github')}
        loading={oauthLoading}
        disabled={isSubmitting}
      />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <hr className="flex-1 border-border" />
        or continue with email
        <hr className="flex-1 border-border" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-3"
      >
        {authError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {authError}
          </div>
        )}
        {authMessage && (
          <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            {authMessage}
          </div>
        )}
        {errors.root && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.root.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  )
}
