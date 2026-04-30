'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export function ContactClient({ userEmail, userName, userId }: { userEmail: string, userName: string, userId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const { error } = await supabase.from('contact_messages').insert({
        user_id: userId,
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
      })

      if (error) throw error
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message sent!</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Thank you for reaching out. We have received your message and will review it shortly.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="btn-primary px-6 py-2.5"
        >
          Send another message
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input required type="text" name="name" defaultValue={userName} placeholder="Your name" className="input-glass w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input required type="email" name="email" defaultValue={userEmail} readOnly className="input-glass w-full opacity-70 cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
          <textarea required name="message" rows={5} placeholder="Tell us anything — bug reports, scholarship suggestions, feedback..." className="input-glass w-full resize-none" />
        </div>
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full btn-primary py-3.5 justify-center text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sending...' : 'Send message'}
        </button>
        {status === 'error' && (
          <p className="text-red-500 text-sm text-center mt-3 bg-red-50 py-2.5 rounded-xl border border-red-100">Failed to send message. Please try again.</p>
        )}
      </form>
    </motion.div>
  )
}
