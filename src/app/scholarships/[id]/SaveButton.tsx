'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface SaveButtonProps {
  scholarshipId: string
}

export function SaveButton({ scholarshipId }: SaveButtonProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('saved_scholarships')
          .select('id')
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarshipId)
          .single()
        if (data) setSaved(true)
      }
      setLoading(false)
    }
    init()
  }, [scholarshipId])

  const toggle = async () => {
    if (!userId) {
      toast.error('Please sign in to save scholarships')
      return
    }
    setLoading(true)

    try {
      if (saved) {
        await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', userId)
          .eq('scholarship_id', scholarshipId)
        setSaved(false)
        toast.success('Removed from saved')
      } else {
        await supabase
          .from('saved_scholarships')
          .insert({ user_id: userId, scholarship_id: scholarshipId })
        setSaved(true)
        toast.success('Scholarship saved! ❤️')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn-ghost gap-2 px-5 py-3 ${saved ? 'border-red-300 text-red-500 bg-red-50/50' : ''}`}
      id="save-scholarship-button"
    >
      <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
