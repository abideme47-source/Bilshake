import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './order-flow.css'
import { CartProvider } from '@/lib/cart'
import { LanguageProvider } from '@/lib/language'
import { RouteHistoryTracker } from '@/components/history-back-link'

export const metadata: Metadata = {
  title: 'Bilshake | Food & Drinks',
  description: 'Fresh juices, burgers, pizza, shawarma, sandwiches and fasting foods at Bilshake.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FBFBF9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RouteHistoryTracker />
        <LanguageProvider><CartProvider>{children}</CartProvider></LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
