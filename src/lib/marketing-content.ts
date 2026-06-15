export const BUILT_WITH = [
  { name: 'Next.js 15', href: 'https://nextjs.org' },
  { name: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { name: 'Supabase', href: 'https://supabase.com' },
  { name: 'Prisma', href: 'https://prisma.io' },
  { name: 'Stripe', href: 'https://stripe.com' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com' },
] as const

export const PLAN_COMPARISON = {
  features: [
    { name: 'Team members', starter: '3', pro: '25', enterprise: 'Unlimited' },
    {
      name: 'Workspaces',
      starter: '1',
      pro: 'Unlimited',
      enterprise: 'Unlimited',
    },
    {
      name: 'Analytics',
      starter: 'Basic',
      pro: 'Advanced',
      enterprise: 'Custom',
    },
    { name: 'API keys', starter: '—', pro: '✓', enterprise: '✓' },
    { name: 'Audit log', starter: '—', pro: '✓', enterprise: '✓' },
    { name: 'SSO / SAML', starter: '—', pro: '—', enterprise: '✓' },
    {
      name: 'Support',
      starter: 'Email',
      pro: 'Priority',
      enterprise: 'Dedicated',
    },
  ],
} as const

export const AUTH_PANEL = {
  eyebrow: 'Ship faster',
  quote: (name: string) =>
    `${name} gives you auth, billing, and multi-tenancy out of the box — so you can focus on your product.`,
  footer: 'Trusted by developers building on GitHub',
} as const

export const CUSTOMIZE_HINT =
  'Example content — edit src/lib/marketing.ts and src/lib/demo-data.ts'
