export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class WebhookError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WebhookError'
  }
}

export class RateLimitError extends Error {
  retryAfter: number

  constructor(retryAfter: number) {
    super('Too many requests')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}
