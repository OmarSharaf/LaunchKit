import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Key,
  Layers,
  LineChart,
  Lock,
  Plug,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import {
  APP_NAME,
  DEVELOPER_LINKEDIN,
  DEVELOPER_URL,
  DEMO_ADMIN_PATH,
  DEMO_DASHBOARD_PATH,
  DOCS_URL,
  GITHUB_REPO,
  SUPPORT_EMAIL,
} from '@/lib/site'

export const STATS = [
  { value: '12k+', label: 'GitHub stars goal' },
  { value: '100%', label: 'Test coverage' },
  { value: 'MIT', label: 'Open license' },
  { value: '< 1 day', label: 'Time to first deploy' },
] as const

export const LOGO_CLOUD = [
  'Next.js',
  'Supabase',
  'Stripe',
  'Prisma',
  'Tailwind',
  'Vercel',
] as const

export const LOGO_CLOUD_TAGLINE =
  'Built with the stack modern SaaS teams ship on'

export const INTEGRATIONS_SECTION = {
  eyebrow: 'Integrations',
  title: 'Payment and auth providers included',
  description:
    'Stripe, PayPal, Whop, Supabase, and Resend are wired in — enable what you need via env vars.',
  extraTools: ['GitHub', 'Vercel', 'Resend', 'PostHog', 'Sentry', 'Docker'],
} as const

export const CTA_SECTION = {
  title: 'Ready to try it for real?',
  description: (appName: string) =>
    `Create a free account on ${appName}, explore the live demo first, or fork the repo and ship your own SaaS.`,
  primaryCta: 'Start free trial',
  secondaryCta: 'View live demo',
} as const

export const TESTIMONIALS_SECTION = {
  eyebrow: 'Testimonials',
  title: 'What builders say after forking',
  description:
    'Placeholder quotes you can replace — typical feedback from teams using this boilerplate.',
} as const

export const FEATURES: {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  hrefLabel?: string
}[] = [
  {
    icon: LineChart,
    title: 'Dashboard shell',
    description:
      'Production sidebar layout with org switcher, command palette, mobile nav, and dark mode.',
    href: DEMO_DASHBOARD_PATH,
    hrefLabel: 'Open demo',
  },
  {
    icon: Workflow,
    title: 'Auth & onboarding',
    description:
      'Supabase email/OAuth, invite flows, password strength, and a setup checklist for new users.',
  },
  {
    icon: Users,
    title: 'Multi-tenant orgs',
    description:
      'Organizations, roles, invitations, and org-scoped data — ready for B2B SaaS.',
  },
  {
    icon: Plug,
    title: 'Billing integrations',
    description:
      'Stripe, PayPal, and Whop checkout, webhooks, and customer portals out of the box.',
    href: `${DEMO_DASHBOARD_PATH}/billing`,
    hrefLabel: 'Billing demo',
  },
  {
    icon: Key,
    title: 'API keys & audit log',
    description:
      'Hashed API keys, audit trail UI, and admin stats for compliance-minded teams.',
  },
  {
    icon: Lock,
    title: 'Security defaults',
    description:
      'CSP headers, rate limiting, webhook idempotency, and role-based access helpers.',
  },
  {
    icon: Bell,
    title: 'Public demo mode',
    description:
      'Full /demo dashboard plus /demo/admin platform console — no login for prospects or GitHub visitors.',
    href: DEMO_ADMIN_PATH,
    hrefLabel: 'Admin demo',
  },
]

export const STEPS = [
  {
    step: '01',
    icon: Zap,
    title: 'Explore or sign up',
    description:
      'Try the live demo with no account, or register free and get a workspace in minutes.',
  },
  {
    step: '02',
    icon: Layers,
    title: 'Pick a plan',
    description:
      'Choose Starter or Pro on Billing — Stripe, Whop, or PayPal checkout when you are ready.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Invite your team',
    description:
      'Add teammates from Settings, track usage in Analytics, and manage billing from one dashboard.',
  },
] as const

export const PLANS = [
  {
    slug: 'starter' as const,
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'For side projects and early-stage products.',
    features: [
      '1 workspace',
      'Up to 3 team members',
      'Core analytics',
      'Email support',
      'Stripe billing',
    ],
    cta: 'Start free trial',
    href: '/auth/register?plan=starter',
    highlighted: false,
  },
  {
    slug: 'pro' as const,
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams shipping real revenue.',
    features: [
      'Unlimited workspaces',
      'Up to 25 members',
      'Advanced analytics',
      'API keys & audit log',
      'Priority support',
      'All payment providers',
    ],
    cta: 'Start free trial',
    href: '/auth/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise' as const,
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced needs.',
    features: [
      'Unlimited everything',
      'SSO / SAML',
      'Dedicated success manager',
      'Custom SLA',
      'Security review',
    ],
    cta: 'Contact sales',
    href: `mailto:${SUPPORT_EMAIL}`,
    highlighted: false,
  },
] as const

export const TESTIMONIALS = [
  {
    quote: `${APP_NAME} saved us weeks of boilerplate work. We forked it Friday and had paying customers by Monday.`,
    author: 'Alex Chen',
    role: 'Indie hacker',
    company: 'Flowstack',
  },
  {
    quote:
      'The demo dashboard alone convinced our team. Clean UI, real patterns, not tutorial code.',
    author: 'Sarah Mitchell',
    role: 'CTO',
    company: 'Nimbus',
  },
  {
    quote:
      'Finally a starter kit with tests, CI, and billing that actually works in production.',
    author: 'James Okonkwo',
    role: 'Founder',
    company: 'DataPulse',
  },
] as const

export const FAQ_ITEMS = [
  {
    question: 'Is this really free?',
    answer: `Yes. ${APP_NAME} is MIT-licensed. Fork it, rebrand it, ship your SaaS — no attribution required (though stars are appreciated).`,
  },
  {
    question: 'Can I use this for client projects?',
    answer:
      'Absolutely. The MIT license allows commercial use. Customize branding and domain logic for each client.',
  },
  {
    question: 'Which payment providers are included?',
    answer:
      'Stripe, PayPal, and Whop are wired with checkout, webhooks, and portal routes. Enable the ones you need via env vars.',
  },
  {
    question: 'What is the difference between the demo and a real account?',
    answer:
      'The /demo routes show sample data with no login. A real account uses Supabase auth, your database, and live billing when payment providers are configured.',
  },
  {
    question: 'What happens after I register?',
    answer:
      'You land on the dashboard, get a default workspace, and can subscribe on Billing. Marketing plan links carry ?plan= so Billing can highlight your chosen tier.',
  },
  {
    question: 'Can teammates join without paying separately?',
    answer:
      'Yes. Org admins invite members from Settings or Team. Billing is per organization, not per seat in this starter kit.',
  },
  {
    question: 'How do I customize the UI?',
    answer:
      'See docs/CUSTOMIZATION.md for branding, theme presets, marketing copy, and the /design-system reference page.',
  },
] as const

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
] as const

export const FOOTER_LINKS = {
  product: [
    { href: '#features', label: 'Features' },
    { href: DEMO_DASHBOARD_PATH, label: 'Live demo' },
    { href: DEMO_ADMIN_PATH, label: 'Admin demo' },
    { href: '#pricing', label: 'Pricing' },
    { href: '/design-system', label: 'Design system' },
    { href: '/docs', label: 'Docs' },
    { href: DOCS_URL, label: 'GitHub docs', external: true },
  ],
  company: [
    { href: GITHUB_REPO, label: 'GitHub', external: true },
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
  ],
  connect: [
    { href: DEVELOPER_LINKEDIN, label: 'LinkedIn', external: true },
    { href: DEVELOPER_URL, label: 'Contact', external: true },
  ],
} as const

export const SHOWCASE_ITEMS = [
  {
    title: 'Unified dashboard',
    description: 'Sidebar, metrics, charts, and activity in one shell.',
    gradient: 'from-primary/20 to-blue-500/10',
    href: DEMO_DASHBOARD_PATH,
  },
  {
    title: 'Billing ready',
    description: 'Checkout, portal, and webhooks for three providers.',
    gradient: 'from-violet-500/20 to-fuchsia-500/10',
    href: `${DEMO_DASHBOARD_PATH}/billing`,
  },
  {
    title: 'Team & settings',
    description: 'Org management, API keys, and tabbed settings.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    href: `${DEMO_DASHBOARD_PATH}/settings`,
  },
] as const
