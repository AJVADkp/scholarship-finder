import Link from 'next/link'
import { GraduationCap, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="relative mb-8 inline-block">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-emerald-100 flex items-center justify-center mx-auto animate-hero-float">
            <GraduationCap size={72} className="text-primary/40" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
            🤔
          </div>
        </div>

        <h1 className="text-6xl font-black text-gray-200 mb-2">404</h1>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Looks like this page took a scholarship abroad! 🌍
          <br />
          Let&apos;s find your way back to better things.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3 gap-2">
            <Home size={16} /> Back to Home
          </Link>
          <Link href="/scholarships" className="btn-ghost px-6 py-3 gap-2">
            <Search size={16} /> Browse Scholarships
          </Link>
        </div>
      </div>
    </div>
  )
}
