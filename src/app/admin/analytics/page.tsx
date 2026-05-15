'use client'

import { useState, useEffect, useCallback } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  BarChart3, Globe, Monitor, Smartphone, Tablet, Users, Eye,
  MapPin, Compass, RefreshCw, TrendingUp,
  ChevronLeft, ChevronRight
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

const VISITS_PER_PAGE = 25

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

  // Stats
  const totalViews = visits.length
  const uniqueIPs = new Set(visits.map(v => v.ip_address)).size
  const topPage = countBy(visits, v => v.page)[0]
  const countries = countBy(visits, v => v.country)
  const cities = countBy(visits, v => v.city)
  const devices = countBy(visits, v => v.device)
  const osList = countBy(visits, v => v.os)
  const browsers = countBy(visits, v => v.browser)
  const pages = countBy(visits, v => v.page)
  const referrers = countBy(visits, v => v.referrer || 'Direct')

  // Device icons
  const deviceIcon = (d: string) => {
    if (d === 'Mobile') return Smartphone
    if (d === 'Tablet') return Tablet
    return Monitor
  }

  // Paginated visit log
  const totalLogPages = Math.ceil(visits.length / VISITS_PER_PAGE)
  const paginatedVisits = visits.slice((logPage - 1) * VISITS_PER_PAGE, logPage * VISITS_PER_PAGE)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            {totalViews} page views · {uniqueIPs} unique visitors
          </p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Eye} label="Page Views" value={totalViews} color="#4F8EF7" />
        <StatCard icon={Users} label="Unique Visitors" value={uniqueIPs} color="#8B5CF6" />
        <StatCard icon={Globe} label="Countries" value={countries.length} sub={countries[0]?.label || '—'} color="#34C48B" />
        <StatCard icon={TrendingUp} label="Top Page" value={topPage?.label || '—'} sub={`${topPage?.count || 0} views`} color="#F59E0B" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <BarList title="Top Pages" icon={BarChart3} items={pages} color="#4F8EF7" />
        <BarList title="Countries" icon={Globe} items={countries} color="#34C48B" />
        <BarList title="Cities" icon={MapPin} items={cities} color="#06B6D4" />
        <BarList title="Devices" icon={Monitor} items={devices} color="#8B5CF6" />
        <BarList title="Operating Systems" icon={Monitor} items={osList} color="#F59E0B" />
        <BarList title="Browsers" icon={Compass} items={browsers} color="#EF4444" />
      </div>

      {/* Referrers */}
      {referrers.length > 0 && (
        <div className="mb-6">
          <BarList title="Traffic Sources (Referrers)" icon={TrendingUp} items={referrers} color="#8B5CF6" />
        </div>
      )}

      {/* Recent Visit Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">Recent Visit Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60 border-b border-gray-100">
              <tr>
                {['Time', 'Page', 'IP', 'Country', 'City', 'Device', 'OS', 'Browser'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : paginatedVisits.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No visits recorded yet</td></tr>
              ) : paginatedVisits.map(v => (
                <tr key={v.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {new Date(v.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-40 truncate">{v.page}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{v.ip_address}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{v.country || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.city || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      v.device === 'Mobile' ? 'bg-purple-50 text-purple-600' :
                      v.device === 'Tablet' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {v.device || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{v.os || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{v.browser || '—'}</td>
                </tr>
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
