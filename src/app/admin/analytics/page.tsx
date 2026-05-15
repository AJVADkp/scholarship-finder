'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, Globe, Monitor, Smartphone, Tablet, Users, Eye,
  MapPin, Compass, RefreshCw, TrendingUp,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react'

type Visit = {
  id: string
  page: string
  ip_address: string
  country: string | null
  city: string | null
  region: string | null
  device: string | null
  os: string | null
  browser: string | null
  screen_width: number | null
  screen_height: number | null
  user_agent: string | null
  referrer: string | null
  created_at: string
}

type GroupedUser = {
  ip: string
  country: string | null
  city: string | null
  device: string | null
  os: string | null
  browser: string | null
  referrer: string | null
  firstVisit: string
  lastVisit: string
  pages: { page: string; time: string }[]
}

type TimeRange = '24h' | '7d' | '30d' | 'all'

function countBy<T>(arr: T[], key: (item: T) => string | null): { label: string; count: number }[] {
  const map: Record<string, number> = {}
  arr.forEach(item => {
    const k = key(item) || 'Unknown'
    map[k] = (map[k] || 0) + 1
  })
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function BarList({ title, icon: Icon, items, color }: {
  title: string; icon: any; items: { label: string; count: number }[]; color: string
}) {
  const max = items[0]?.count || 1
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} style={{ color }} />
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      <div className="space-y-2.5">
        {items.slice(0, 8).map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700 truncate mr-2">{item.label}</span>
              <span className="font-bold text-gray-500 flex-shrink-0">{item.count}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(item.count / max) * 100}%`, background: color }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-400">No data yet</p>}
      </div>
    </div>
  )
}

function UserRow({ user }: { user: GroupedUser }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr
        className="hover:bg-white/40 transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
          {new Date(user.lastVisit).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{user.ip}</td>
        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.country || '—'}</td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{user.city || '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            user.device === 'Mobile' ? 'bg-purple-50 text-purple-600' :
            user.device === 'Tablet' ? 'bg-amber-50 text-amber-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            {user.device || '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{user.os || '—'}</td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{user.browser || '—'}</td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-bold text-gray-600">{user.pages.length}</span> pages
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} className="px-4 py-0">
            <div className="bg-gray-50/80 rounded-xl my-1.5 p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pages Visited</p>
              <div className="space-y-1.5">
                {user.pages.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{p.page}</span>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(p.time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

const USERS_PER_PAGE = 25

export default function AdminAnalyticsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [logPage, setLogPage] = useState(1)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`)
      const data = await res.json()
      setVisits(data.visits || [])
    } catch {
      setVisits([])
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => { fetchVisits() }, [fetchVisits])

  // Group visits by unique IP
  const groupedUsers: GroupedUser[] = (() => {
    const map = new Map<string, GroupedUser>()
    visits.forEach(v => {
      const existing = map.get(v.ip_address)
      if (existing) {
        existing.pages.push({ page: v.page, time: v.created_at })
        if (v.created_at > existing.lastVisit) {
          existing.lastVisit = v.created_at
          // Update device info with latest visit
          existing.country = v.country || existing.country
          existing.city = v.city || existing.city
          existing.device = v.device || existing.device
          existing.os = v.os || existing.os
          existing.browser = v.browser || existing.browser
        }
        if (v.created_at < existing.firstVisit) existing.firstVisit = v.created_at
      } else {
        map.set(v.ip_address, {
          ip: v.ip_address,
          country: v.country,
          city: v.city,
          device: v.device,
          os: v.os,
          browser: v.browser,
          referrer: v.referrer,
          firstVisit: v.created_at,
          lastVisit: v.created_at,
          pages: [{ page: v.page, time: v.created_at }],
        })
      }
    })
    // Sort pages within each user by time descending
    map.forEach(u => u.pages.sort((a, b) => b.time.localeCompare(a.time)))
    return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
  })()

  const uniqueVisitors = groupedUsers.length

  // Count by unique users (1 per IP)
  const countries = countBy(groupedUsers, u => u.country)
  const cities = countBy(groupedUsers, u => u.city)
  const devices = countBy(groupedUsers, u => u.device)
  const osList = countBy(groupedUsers, u => u.os)
  const browsers = countBy(groupedUsers, u => u.browser)
  const referrers = countBy(groupedUsers, u => u.referrer || 'Direct')

  // Pagination
  const totalLogPages = Math.ceil(groupedUsers.length / USERS_PER_PAGE)
  const paginatedUsers = groupedUsers.slice((logPage - 1) * USERS_PER_PAGE, logPage * USERS_PER_PAGE)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">{uniqueVisitors} unique visitors</p>
        </div>
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d', 'all'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => { setTimeRange(range); setLogPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {range === '24h' ? '24h' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
          <button onClick={fetchVisits} className="p-2 rounded-lg bg-white/60 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} label="Unique Visitors" value={uniqueVisitors} color="#8B5CF6" />
        <StatCard icon={Globe} label="Countries" value={countries.length} sub={countries[0]?.label || '—'} color="#34C48B" />
        <StatCard icon={Monitor} label="Top Device" value={devices[0]?.label || '—'} sub={`${devices[0]?.count || 0} visitors`} color="#4F8EF7" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <BarList title="Countries" icon={Globe} items={countries} color="#34C48B" />
        <BarList title="Cities" icon={MapPin} items={cities} color="#06B6D4" />
        <BarList title="Devices" icon={Monitor} items={devices} color="#8B5CF6" />
        <BarList title="Operating Systems" icon={Monitor} items={osList} color="#F59E0B" />
        <BarList title="Browsers" icon={Compass} items={browsers} color="#EF4444" />
        <BarList title="Traffic Sources" icon={TrendingUp} items={referrers} color="#8B5CF6" />
      </div>

      {/* Visitor Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">Visitor Log</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click a row to see pages visited</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60 border-b border-gray-100">
              <tr>
                {['Last Seen', 'IP Address', 'Country', 'City', 'Device', 'OS', 'Browser', 'Pages'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No visitors recorded yet</td></tr>
              ) : paginatedUsers.map(u => (
                <UserRow key={u.ip} user={u} />
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalLogPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button
              onClick={() => setLogPage(p => Math.max(1, p - 1))}
              disabled={logPage === 1}
              className="p-2 rounded-xl border border-gray-200 bg-white/60 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Page {logPage} of {totalLogPages}
            </span>
            <button
              onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))}
              disabled={logPage === totalLogPages}
              className="p-2 rounded-xl border border-gray-200 bg-white/60 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
