import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin — ScholarSearch' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
