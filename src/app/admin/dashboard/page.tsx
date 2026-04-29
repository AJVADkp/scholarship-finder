import { createAdminClient } from '@/lib/supabase/admin'
import { BookOpen, Users, BarChart3, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [
    { count: totalScholarships },
    { count: activeScholarships },
    { count: totalUsers },
    { count: usersWithMarks },
    { data: recentUsers },
    { data: recentScholarships },
  ] = await Promise.all([
    supabase.from('scholarships').select('*', { count: 'exact', head: true }),
    supabase.from('scholarships').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).not('marks_percentage', 'is', null),
    supabase.from('users').select('full_name, email, created_at, avatar_url').order('created_at', { ascending: false }).limit(5),
    supabase.from('scholarships').select('id, title, category, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Scholarships', value: totalScholarships || 0, icon: BookOpen, color: '#4F8EF7', href: '/admin/scholarships' },
    { label: 'Active Scholarships', value: activeScholarships || 0, icon: CheckCircle, color: '#34C48B', href: '/admin/scholarships' },
    { label: 'Total Users', value: totalUsers || 0, icon: Users, color: '#8B5CF6', href: '/admin/users' },
    { label: 'Users with Marks', value: usersWithMarks || 0, icon: BarChart3, color: '#F59E0B', href: '/admin/users' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of ScholarSearch platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass-card p-5 flex items-center gap-4 hover:shadow-glass-lg transition-all no-underline group"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${stat.color}18` }}
            >
              <stat.icon size={22} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
            <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-purple-500" /> Recent Users
            </h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline font-semibold">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers && recentUsers.length > 0 ? recentUsers.map((u: any) => (
              <div key={u.email} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(u.full_name || u.email || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.full_name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Clock size={11} />
                  {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400">No users yet</p>
            )}
          </div>
        </div>

        {/* Recent scholarships */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500" /> Recent Scholarships
            </h2>
            <Link href="/admin/scholarships" className="text-xs text-primary hover:underline font-semibold">View all</Link>
          </div>
          <div className="space-y-3">
            {recentScholarships && recentScholarships.length > 0 ? recentScholarships.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.category}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Clock size={11} />
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400">No scholarships yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
