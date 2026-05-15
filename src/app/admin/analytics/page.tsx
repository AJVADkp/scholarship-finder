'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, Globe, Monitor, Smartphone, Tablet, Users, Eye,
  MapPin, Compass, RefreshCw, TrendingUp,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, User
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
  user_name: string | null
  user_id: string | null
  created_at: string
}

type GroupedUser = {
  key: string
  ip: string
  country: string | null
  city: string | null
  device: string | null
  os: string | null
  browser: string | null
  referrer: string | null
  user_name: string | null
  user_id: string | null
  firstVisit: string
  lastVisit: string
  pages: { page: string; time: string }[]
}

type UserProfileData = {
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  dob: string | null
  academic_level: string | null
  gender: string | null
  state: string | null
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

// User profile popup modal
function UserProfileModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(data => { setProfile(data.user || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-700">User Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : !profile ? (
          <p className="text-sm text-gray-400 text-center py-8">User not found</p>
        ) : (
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-16 h-16 rounded-full object-cover mb-3 ring-2 ring-white shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold mb-3 ring-2 ring-white shadow-md">
                {(profile.full_name || profile.email || 'U')[0].toUpperCase()}
              </div>
            )}

            {/* Name */}
            <h4 className="text-base font-bold text-gray-900">{profile.full_name || 'N/A'}</h4>

            {/* Details list */}
            <div className="mt-4 w-full space-y-2.5 text-left">
              {[
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
                { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                { label: 'Gender', value: profile.gender },
                { label: 'Academic Level', value: profile.academic_level },
                { label: 'State', value: profile.state },
                { label: 'Joined', value: new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs border-b border-gray-100 pb-2 last:border-0">
                  <span className="font-medium text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UserRow({ user, onUserClick }: { user: GroupedUser; onUserClick: (userId: string) => void }) {
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
        <td className="px-4 py-3 whitespace-nowrap">
          {user.user_name ? (
            <button
              onClick={(e) => { e.stopPropagation(); if (user.user_id) onUserClick(user.user_id) }}
              className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full hover:bg-emerald-100 hover:ring-1 hover:ring-emerald-300 transition-all cursor-pointer"
            >
              {user.user_name}
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">Guest</span>
          )}
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
          <td colSpan={9} className="px-4 py-0">
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
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

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

  // Group visits by unique IP + user identity
  // If same IP has different user_ids, they become separate rows
  const groupedUsers: GroupedUser[] = (() => {
    const map = new Map<string, GroupedUser>()
    visits.forEach(v => {
      // Composite key: IP + user_id (or "guest")
      const userKey = `${v.ip_address}::${v.user_id || 'guest'}`
      const existing = map.get(userKey)
      if (existing) {
        existing.pages.push({ page: v.page, time: v.created_at })
        if (v.created_at > existing.lastVisit) {
          existing.lastVisit = v.created_at
          existing.country = v.country || existing.country
          existing.city = v.city || existing.city
          existing.device = v.device || existing.device
          existing.os = v.os || existing.os
          existing.browser = v.browser || existing.browser
        }
        if (v.created_at < existing.firstVisit) existing.firstVisit = v.created_at
        // Update user_name if we get one
        if (v.user_name) existing.user_name = v.user_name
        if (v.user_id) existing.user_id = v.user_id
      } else {
        map.set(userKey, {
          key: userKey,
          ip: v.ip_address,
          country: v.country,
          city: v.city,
          device: v.device,
          os: v.os,
          browser: v.browser,
          referrer: v.referrer,
          user_name: v.user_name,
          user_id: v.user_id,
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
          <p className="text-xs text-gray-400 mt-0.5">Click a row to see pages visited · Click a username for profile details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60 border-b border-gray-100">
              <tr>
                {['Last Seen', 'User', 'IP Address', 'Country', 'City', 'Device', 'OS', 'Browser', 'Pages'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No visitors recorded yet</td></tr>
              ) : paginatedUsers.map(u => (
                <UserRow key={u.key} user={u} onUserClick={(id) => setProfileUserId(id)} />
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

      {/* User Profile Popup */}
      {profileUserId && (
        <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  )
}
