import Link from 'next/link'
import { GraduationCap, ExternalLink, Link2, Mail } from 'lucide-react'
import { ALL_CATEGORIES } from '@/lib/types'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/40 bg-white/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg text-gray-900 no-underline mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-sm">
                <GraduationCap size={20} className="text-white" />
              </div>
              ScholarSearch
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Find your perfect scholarship. We help students discover, filter, and apply for the best scholarships across India and the world.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 glass-card flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                <ExternalLink size={14} />
              </a>
              <a href="#" className="w-8 h-8 glass-card flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                <Link2 size={14} />
              </a>
              <a href="#" className="w-8 h-8 glass-card flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wide">Categories</h4>
            <ul className="space-y-2">
              {ALL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/scholarships/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-gray-500 hover:text-primary transition-colors no-underline"
                  >
                    {cat} Scholarships
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/scholarships', label: 'Browse Scholarships' },
                { href: '/dashboard', label: 'My Dashboard' },
                { href: '/dashboard/saved', label: 'Saved Scholarships' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wide">Support</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Contact', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ScholarSearch. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built with ❤️ for students everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
