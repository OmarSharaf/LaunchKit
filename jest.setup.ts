import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock'
process.env.WHOP_API_KEY = 'whop_test_mock'
process.env.WHOP_WEBHOOK_SECRET = 'whsec_whop_test_mock'
process.env.WHOP_COMPANY_ID = 'biz_test_mock'
process.env.PAYPAL_CLIENT_ID = 'paypal_test_mock'
process.env.PAYPAL_CLIENT_SECRET = 'paypal_secret_test_mock'
process.env.PAYPAL_WEBHOOK_ID = 'paypal_webhook_test_mock'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_APP_NAME = 'Launch Kit'
process.env.NEXT_PUBLIC_APP_TAGLINE = 'Ship your SaaS in days, not months.'
process.env.NEXT_PUBLIC_APP_DESCRIPTION =
  'Launch Kit is a production-ready boilerplate with auth, billing, multi-tenancy, and a polished UI — fork it and make it yours.'
process.env.NEXT_PUBLIC_DOCS_URL = 'https://github.com/OmarSharaf/launchkit'

jest.mock('geist/font/sans', () => ({
  GeistSans: { variable: '--font-geist-sans' },
}))

jest.mock('geist/font/mono', () => ({
  GeistMono: { variable: '--font-geist-mono' },
}))
