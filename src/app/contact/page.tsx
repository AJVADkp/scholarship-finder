import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Footer } from '@/components/layout/Footer'
import { SearchLoginPrompt } from '@/components/search/SearchLoginPrompt'
import { ContactClient } from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us — ScholarSearch',
  description: 'Have a question or suggestion? Get in touch with the ScholarSearch team.',
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
    userProfile = data
  }

  return (
    <>
      <main className="max-w-[640px] mx-auto px-4 sm:px-6 py-12 lg:py-20 min-h-[70vh]">
        <div className="text-center mb-10">
          <div className="text-[11px] tracking-[0.12em] text-[#4F8EF7] font-medium uppercase mb-3">Get in touch</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">Contact Us</h1>
          <p className="text-[#4a5568] max-w-lg mx-auto">
            Have a question, found a bug, or know of a scholarship we should add to our database? Reach out — we read every message.
          </p>
        </div>

        {user ? (
          <ContactClient userEmail={user.email || ''} userName={userProfile?.full_name || ''} userId={user.id} />
        ) : (
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Sign in to contact us</h3>
            <SearchLoginPrompt />
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
