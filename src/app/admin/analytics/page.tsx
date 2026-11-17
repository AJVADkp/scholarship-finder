'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  AnalyticsStatsOverview,
  type AnalyticsItem,
} from '@/components/admin/AnalyticsStats'
import {
  AnalyticsUserModal,
  type GroupedUser,
  type UserProfileData,
} from '@/components/admin/AnalyticsUserModal'

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

type TimeRange = '24h' | '7d' | '30d' | 'all'

function countBy<T>(arr: T[], key: (item: T) => string | null): AnalyticsItem[] {
  const map: Record<string, number> = {}
  arr.forEach(item => {
    const k = key(item) || 'Unknown'
    map[k] = (map[k] || 0) + 1
  })
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export default function AdminAnalyticsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [selectedUser, setSelectedUser] = useState<GroupedUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`)
      const data = await res.json()
      if (data.visits) setVisits(data.visits)
    } catch (err) {
      console.error('[Analytics] Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  // Group visits by unique IP + user identity
  const userMap = new Map<string, GroupedUser>()
  visits.forEach(v => {
    const key = `${v.ip_address}__${v.user_id || 'anon'}`
    if (!userMap.has(key)) {
      userMap.set(key, {
        key,
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
    } else {
      const existing = userMap.get(key)!
      existing.pages.push({ page: v.page, time: v.created_at })
      if (new Date(v.created_at) > new Date(existing.lastVisit)) existing.lastVisit = v.created_at
      if (new Date(v.created_at) < new Date(existing.firstVisit)) existing.firstVisit = v.created_at
      if (v.user_name && !existing.user_name) existing.user_name = v.user_name
      if (v.user_id && !existing.user_id) existing.user_id = v.user_id
    }
  })

  const uniqueUsersList = Array.from(userMap.values()).sort(
    (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  )

  const openUserModal = async (u: GroupedUser) => {
    setSelectedUser(u)
    setUserProfile(null)
    if (!u.user_id) return

    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/admin/users/${u.user_id}`)
      const data = await res.json()
      if (data.user) setUserProfile(data.user)
    } catch {
      console.error('[Analytics] Failed to fetch user profile')
    } finally {
      setLoadingProfile(false)
    }
  }

  const topPages = countBy(visits, v => v.page)
  const topCountries = countBy(visits, v => v.country)
  const topDevices = countBy(visits, v => v.device)
  const topBrowsers = countBy(visits, v => v.browser)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">First-party privacy-respecting platform telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d', 'all'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === r
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
          <button
            onClick={fetchVisits}
            className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-16 text-center text-gray-400">Loading metrics...</div>
      ) : (
        <>
          <AnalyticsStatsOverview
            totalVisits={visits.length}
            uniqueUsers={uniqueUsersList.length}
            topPages={topPages}
            topCountries={topCountries}
            topDevices={topDevices}
            topBrowsers={topBrowsers}
          />

          {/* Visitor Sessions Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">
                Visitor Sessions ({uniqueUsersList.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-3">Visitor</th>
                    <th className="p-3">IP Subnet</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Pages</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {uniqueUsersList.map(u => (
                    <tr key={u.key} className="hover:bg-gray-50/60">
                      <td className="p-3">
                        <span className="font-semibold text-gray-900">
                          {u.user_name || 'Anonymous Visitor'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-500">{u.ip}</td>
                      <td className="p-3 text-gray-600">{u.city ? `${u.city}, ` : ''}{u.country || 'Unknown'}</td>
                      <td className="p-3">
                        <span className="font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {u.pages.length}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{new Date(u.lastVisit).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openUserModal(u)}
                          className="btn-ghost text-xs py-1 px-2.5"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Drill-down Modal */}
      <AnalyticsUserModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        profile={userProfile}
        loadingProfile={loadingProfile}
      />
    </div>
  )
}
