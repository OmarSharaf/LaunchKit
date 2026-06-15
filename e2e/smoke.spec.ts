import { test, expect } from '@playwright/test'

test.describe('Marketing smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('demo dashboard is public', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.getByText(/Good morning|Demo mode/i)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()
  })

  test('demo analytics and team pages load', async ({ page }) => {
    await page.goto('/demo/analytics')
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
    await page.goto('/demo/team')
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(
      page.getByRole('heading', { name: /Welcome back/i })
    ).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(
      page.getByRole('heading', { name: /Create your account/i })
    ).toBeVisible()
  })

  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBeLessThan(600)
    const body = await response.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('timestamp')
  })

  test('privacy and terms pages load', async ({ page }) => {
    await page.goto('/privacy')
    await expect(
      page.getByRole('heading', { name: 'Privacy Policy' })
    ).toBeVisible()
    await page.goto('/terms')
    await expect(
      page.getByRole('heading', { name: 'Terms of Service' })
    ).toBeVisible()
  })
})
