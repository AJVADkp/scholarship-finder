import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
}

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-4">{children}</div>
}
