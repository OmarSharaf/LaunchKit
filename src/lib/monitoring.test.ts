import { captureException } from './monitoring'

describe('monitoring', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation()
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
  })

  it('logs errors without Sentry DSN', () => {
    captureException(new Error('test error'), { context: 'unit' })
    expect(console.error).toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('reports to Sentry when DSN is set', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://abc@o123.ingest.sentry.io/456'
    captureException(new Error('sentry test'))
    await new Promise((r) => setTimeout(r, 0))
    expect(global.fetch).toHaveBeenCalled()
  })
})
