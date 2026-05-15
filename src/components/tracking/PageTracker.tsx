'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (/windows/i.test(ua)) return 'Windows'
  if (/macintosh|mac os x/i.test(ua)) return 'macOS'
  if (/linux/i.test(ua)) return 'Linux'
  if (/android/i.test(ua)) return 'Android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/cros/i.test(ua)) return 'ChromeOS'
  return 'Unknown'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/chrome|chromium|crios/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Unknown'
}

function sendTrack(page: string, userName: string | null, userId: string | null) {
  const payload = {
    page,
    referrer: document.referrer || null,
    device: getDeviceType(),
    os: getOS(),
    browser: getBrowser(),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    user_name: userName,
    user_id: userId,
  }
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', blob)
  } else {
    fetch('/api/track', { method: 'POST', body: blob, keepalive: true }).catch(() => {})
  }
}

export function PageTracker() {
  const pathname = usePathname()
  const lastTracked = useRef('')
  const [userName, setUserName] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userReady, setUserReady] = useState(false)

  // Fetch logged-in user's name once on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setUserName(data?.full_name || user.email || null)
            setUserId(user.id)
            setUserReady(true)
          })
      } else {
        setUserReady(true)
      }
    }).catch(() => {
      setUserReady(true)
    })
  }, [])

  // Track page visits — waits for user check to finish first
  useEffect(() => {
    if (!userReady) return
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return
    if (pathname === lastTracked.current) return
    lastTracked.current = pathname

    const timer = setTimeout(() => sendTrack(pathname, userName, userId), 300)
    return () => clearTimeout(timer)
  }, [pathname, userReady, userName, userId])

  return null
}
