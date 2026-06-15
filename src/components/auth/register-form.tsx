'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AUTH_CALLBACK_URL } from '@/lib/site'
import { signUpSchema, type SignUpInput } from '@/lib/validations'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { PasswordStrength } from '@/components/auth/password-strength'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(
    null
  )
  const [passwordValue, setPasswordValue] = useState('')
  const [signupsEnabled, setSignupsEnabled] = useState(true)
  const [signupStatusLoading, setSignupStatusLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/signup-status')
      .then((res) => res.json())
      .then((data: { signupsEnabled?: boolean }) => {
        setSignupsEnabled(data.signupsEnabled !== false)
      })
      .catch(() => setSignupsEnabled(true))
      .finally(() => setSignupStatusLoading(false))
  }, [])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const supabase = createClient()

  async function signInWithOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: AUTH_CALLBACK_URL },
    })
    if (error) {
      setOauthLoading(null)
      setError('root', { message: error.message })
    }
  }

  async function onSubmit(data: SignUpInput) {
    if (!signupsEnabled) {
      setError('root', {
        message: 'New signups are currently disabled. Please try again later.',
      })
      return
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
        emailRedirectTo: AUTH_CALLBACK_URL,
      },
    })

    if (error) {
      setError('root', { message: error.message })
      return
    }

    setSuccess(true)
  }

  if (!signupStatusLoading && !signupsEnabled) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <h2 className="mb-2 font-semibold">Signups paused</h2>
        <p className="text-sm text-muted-foreground">
          New account registration is temporarily disabled. Contact support if
          you need access.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="mb-3 text-4xl">📬</div>
        <h2 className="mb-2 font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to your email. Click it to
          activate your account.
        </p>
      </div>
    )
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
        {errors.root && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.root.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            {...register('name')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

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
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register('password', {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
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
          <PasswordStrength password={passwordValue} />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !!oauthLoading}
          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
    </div>
  )
}
