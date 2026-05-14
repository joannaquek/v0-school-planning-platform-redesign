import type { Metadata, Viewport } from 'next'
import { Karla } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const karla = Karla({ 
  subsets: ["latin"],
  variable: '--font-karla',
});

export const metadata: Metadata = {
  title: 'SchoolMatch SG | Find Your Perfect Primary School',
  description:
    'Singapore P1 registration planner: browse MOE primary schools, ballot pressure and vacancy data, multi-year trends, distance search and map, plus side-by-side school comparison for informed choices.',
  generator: 'v0.app',
  keywords: ['P1 registration', 'Singapore primary school', 'school finder', 'MOE', 'primary 1', 'school registration'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f5f0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" data-scroll-behavior="smooth">
      <body className={`${karla.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
