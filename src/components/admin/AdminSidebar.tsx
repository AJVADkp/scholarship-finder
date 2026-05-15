'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, Users, Settings, LogOut, GraduationCap, Menu, X, MessageSquare, AlertCircle, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/scholarships', icon: BookOpen, label: 'Scholarships' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  if (pathname === '/admin/login') {
    return null
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    // Force full page refresh to clear all cached admin data
    window.location.href = '/admin/login'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm">ScholarSearch</div>
            <div className="text-xs text-white/40">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="admin-nav-item w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Sign Out?"
        message="Are you sure you want to sign out of the admin panel?"
        confirmText="Sign Out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        icon={LogOut}
      />
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar w-56 flex-shrink-0 hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="admin-sidebar fixed top-0 left-0 w-64 h-full z-50 animate-slide-up">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
