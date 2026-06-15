describe('site constants', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
  })

  it('uses defaults when env vars are unset', async () => {
    delete process.env.NEXT_PUBLIC_APP_NAME
    delete process.env.NEXT_PUBLIC_APP_URL

    const site = await import('./site')
    expect(site.APP_NAME).toBe('Launch Kit')
    expect(site.APP_URL).toBe('https://launchkit.dev')
    expect(site.DEVELOPER_NAME).toBe('Omar S. M. Abdelfatah')
    expect(site.DEMO_DASHBOARD_PATH).toBe('/demo')
  })

  it('reads branding from environment variables', async () => {
    process.env.NEXT_PUBLIC_APP_NAME = 'My SaaS'
    process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.test'
    process.env.NEXT_PUBLIC_APP_TAGLINE = 'Custom tagline'
    process.env.NEXT_PUBLIC_APP_DESCRIPTION = 'Custom description'
    process.env.NEXT_PUBLIC_GITHUB_REPO = 'https://github.com/test/repo'
    process.env.NEXT_PUBLIC_DOCS_URL = 'https://docs.test'
    process.env.NEXT_PUBLIC_DEMO_URL = 'https://demo.test'
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL = 'hello@test.com'

    const site = await import('./site')
    expect(site.APP_NAME).toBe('My SaaS')
    expect(site.APP_URL).toBe('https://myapp.test')
    expect(site.APP_TAGLINE).toBe('Custom tagline')
    expect(site.APP_DESCRIPTION).toBe('Custom description')
    expect(site.GITHUB_REPO).toBe('https://github.com/test/repo')
    expect(site.DOCS_URL).toBe('https://docs.test')
    expect(site.DEMO_URL).toBe('https://demo.test')
    expect(site.SUPPORT_EMAIL).toBe('hello@test.com')
  })

  it('adds https when app url omits protocol', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'myapp.vercel.app'

    const site = await import('./site')
    expect(site.APP_URL).toBe('https://myapp.vercel.app')
  })
})
