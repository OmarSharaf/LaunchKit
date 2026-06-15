import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { DeveloperCredit } from '@/components/layout/developer-credit'
import { SkipLink } from '@/components/layout/skip-link'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { DEFAULT_THEME_PRESET } from '@/lib/theme-presets'
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  APP_URL,
  DEVELOPER_NAME,
} from '@/lib/site'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE.split('.')[0]}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'saas boilerplate',
    'nextjs starter',
    'supabase auth',
    'stripe billing',
    'open source',
    'multi-tenant',
  ],
  authors: [{ name: DEVELOPER_NAME, url: 'https://www.omarsharaf.me' }],
  creator: DEVELOPER_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: `${APP_NAME} — ${APP_TAGLINE.split('.')[0]}`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — ${APP_TAGLINE.split('.')[0]}`,
    description: APP_DESCRIPTION,
    creator: '@OmarSharaf',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      data-theme-preset={DEFAULT_THEME_PRESET}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <SkipLink />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-1 flex-col">{children}</div>
          <DeveloperCredit variant="bar" />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
