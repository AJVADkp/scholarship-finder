'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Search, BookOpen, LayoutDashboard, LogOut, ChevronDown, Menu, X, Heart } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setUserProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) toast.error('Sign in failed. Please try again.')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setDropdownOpen(false)
    setSignOutConfirmOpen(false)
    toast.success('Signed out successfully')
    // Force full page refresh to clear all cached user data
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/about', label: 'About Us' },
  ]
  
  if (user) {
    navLinks.push({ href: '/dashboard', label: 'Dashboard' })
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="glass-nav sticky top-0 z-40 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg text-gray-900 no-underline">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-sm">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="hidden sm:block">ScholarSearch</span>
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 no-underline ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/50 transition-all duration-200"
                  id="user-menu-button"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-bold">
                      {(userProfile?.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-24 truncate">
                    {userProfile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-card p-1.5 animate-scale-in" style={{ zIndex: 100 }}>
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{userProfile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors no-underline"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link
                      href="/dashboard/saved"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors no-underline"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Heart size={14} /> Saved
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        setSignOutConfirmOpen(true)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleSignIn} className="btn-primary text-sm px-4 py-2 gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel mx-3 mb-3 p-2 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold no-underline ${
                  isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Sign Out Confirmation Modal */}
      {signOutConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-card p-8 w-full max-w-sm animate-scale-in text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-12 -mt-12" />
            
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} />
            </div>
            
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Sign Out?</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              Are you sure you want to sign out of your account?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSignOutConfirmOpen(false)}
                className="btn-ghost flex-1 justify-center py-3 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 py-3 font-black transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
