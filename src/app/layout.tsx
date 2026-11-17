import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { DynamicParticleBackground } from '@/components/layout/DynamicParticleBackground'
import { ConditionalNavbar } from '@/components/layout/ConditionalNavbar'
import { Analytics } from '@vercel/analytics/react'
import { PageTracker } from '@/components/tracking/PageTracker'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ScholarSearch — Find Your Perfect Scholarship',
    template: '%s | ScholarSearch',
  },
  description:
    'Discover thousands of scholarships tailored to your academic profile. Filter by category, marks, deadline, and country. Find merit, need-based, government, and international scholarships.',
  keywords: ['scholarships', 'scholarship finder', 'india scholarships', 'merit scholarship', 'student funding'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/logo.webp',
    apple: '/logo.webp',
  },
  openGraph: {
    type: 'website',
    siteName: 'ScholarSearch',
    title: 'ScholarSearch — Find Your Perfect Scholarship',
    description: 'Discover thousands of scholarships tailored to your academic profile.',
    images: [{ url: '/logo.webp', width: 512, height: 512, alt: 'ScholarSearch' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} antialiased min-h-screen text-slate-900 bg-transparent`}>
        <DynamicParticleBackground />
        <ConditionalNavbar />
        <main className="min-h-[calc(100vh-64px)] relative z-10">{children}</main>
        <Toaster />
        <Analytics />
        <PageTracker />
      </body>
    </html>
  )
}
