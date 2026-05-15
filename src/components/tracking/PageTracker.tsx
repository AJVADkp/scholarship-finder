'use client'

import { useEffect, useRef } from 'react'
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

export function PageTracker() {
  const pathname = usePathname()
  const lastTracked = useRef('')
  const userName = useRef<string | null>(null)
  const userFetched = useRef(false)

  // Fetch logged-in user's name once
  useEffect(() => {
    if (userFetched.current) return
    userFetched.current = true
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            userName.current = data?.full_name || user.email || null
          })
      }
    })
  }, [])

  useEffect(() => {
    // Don't track admin pages or the same page twice in a row
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return
    if (pathname === lastTracked.current) return
    lastTracked.current = pathname

    // Small delay to avoid tracking instant redirects
    const timer = setTimeout(() => {
      const payload = {
        page: pathname,
        referrer: document.referrer || null,
        device: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        user_name: userName.current,
      }

      // Use sendBeacon for reliability, fall back to fetch
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', blob)
      } else {
        fetch('/api/track', { method: 'POST', body: blob, keepalive: true }).catch(() => {})
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
