import { randomUUID } from 'crypto'
import { logger } from '@/lib/logger'

interface SentryDsn {
  publicKey: string
  host: string
  projectId: string
}

function parseSentryDsn(dsn: string): SentryDsn | null {
  try {
    const url = new URL(dsn)
    const projectId = url.pathname.replace(/^\//, '')
    const publicKey = url.username
    if (!publicKey || !projectId) return null
    return { publicKey, host: url.host, projectId }
  } catch {
    return null
  }
}

async function reportToSentry(
  error: unknown,
  context?: Record<string, unknown>
) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  const parsed = parseSentryDsn(dsn)
  if (!parsed) return

  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  const body = {
    event_id: randomUUID().replace(/-/g, ''),
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level: 'error',
    exception: {
      values: [{ type: 'Error', value: message, stacktrace: { frames: [] } }],
    },
    extra: context,
    ...(stack ? { message } : {}),
  }

  try {
    await fetch(`https://${parsed.host}/api/${parsed.projectId}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=launchkit/1.0`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    // if Sentry is down, don't take the app down with it
  }
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  logger.error(message, { stack, ...context })
  void reportToSentry(error, context)
}
