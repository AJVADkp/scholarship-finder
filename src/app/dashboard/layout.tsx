import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Heart } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <aside className="sm:w-56 flex-shrink-0">
          <div className="glass-card p-3 space-y-1 sm:sticky sm:top-20">
            <nav>
              {[
                { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { href: '/dashboard/saved', icon: Heart, label: 'Saved' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-primary hover:bg-primary/5 transition-all no-underline"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
