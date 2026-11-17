'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Application ErrorBoundary Caught]:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-card p-8 text-center border-red-100">
        <div className="w-16 h-16 bg-red-100/80 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <AlertCircle size={32} />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>

        {error.digest && (
          <p className="text-xs font-mono bg-gray-100 py-1.5 px-3 rounded-lg text-gray-500 mb-6 break-all">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary gap-2 py-2.5 px-5 justify-center"
          >
            <RefreshCw size={15} /> Try again
          </button>
          <Link
            href="/"
            className="btn-ghost gap-2 py-2.5 px-5 justify-center border border-gray-200"
          >
            <Home size={15} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
