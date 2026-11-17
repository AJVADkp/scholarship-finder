'use client'

import { X } from 'lucide-react'

export type GroupedUser = {
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

export type UserProfileData = {
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

interface AnalyticsUserModalProps {
  user: GroupedUser | null
  onClose: () => void
  profile: UserProfileData | null
  loadingProfile: boolean
}

export function AnalyticsUserModal({
  user,
  onClose,
  profile,
  loadingProfile,
}: AnalyticsUserModalProps) {
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="glass-card bg-white p-6 sm:p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user.user_name ? user.user_name[0].toUpperCase() : '👤'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {user.user_name || 'Anonymous Visitor'}
              </h3>
              <p className="text-xs text-gray-400 font-mono">{user.ip}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* User Account Info if logged in */}
        {user.user_id && (
          <div className="bg-blue-50/60 rounded-xl p-4 mb-5 border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              Registered Student Profile
            </p>
            {loadingProfile ? (
              <p className="text-xs text-gray-400">Loading student profile...</p>
            ) : profile ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-semibold text-gray-800">{profile.full_name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-semibold text-gray-800">{profile.email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Level:</span>
                  <span className="font-semibold text-gray-800">
                    {profile.academic_level || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">State:</span>
                  <span className="font-semibold text-gray-800">{profile.state || '—'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Profile data unavailable</p>
            )}
          </div>
        )}

        {/* Session Meta */}
        <div className="space-y-2 mb-5 text-xs text-gray-600">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Location</span>
            <span className="font-medium">
              {user.city ? `${user.city}, ` : ''}
              {user.country || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Device / OS</span>
            <span className="font-medium">
              {user.device || 'Unknown'} · {user.os || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-400">Browser</span>
            <span className="font-medium">{user.browser || 'Unknown'}</span>
          </div>
        </div>

        {/* Pages Visited Trail */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Pages Visited ({user.pages.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {user.pages.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1.5 px-3 bg-gray-50 rounded-lg"
              >
                <span className="font-mono text-gray-700 truncate max-w-64">{p.page}</span>
                <span className="text-gray-400 text-[10px]">
                  {new Date(p.time).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
