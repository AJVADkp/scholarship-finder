'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Fatal Error]:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h1>
          <p className="text-sm text-gray-600 mb-6">
            A critical system error occurred. Please refresh or try again later.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
