import { createAdminClient } from '@/lib/supabase/admin'
import { Mail, Clock, User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages | Admin' }

export default async function AdminMessagesPage() {
  const supabase = createAdminClient()

  // Fetch messages ordered by newest first
  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Contact Messages</h1>
        <p className="text-gray-500 text-sm">Review messages sent by users from the contact form</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">
          Failed to load messages. Please ensure you have created the `contact_messages` table.
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Mail size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No messages yet</h3>
          <p className="text-gray-400 text-sm">
            When users send a message via the contact form, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    {msg.name}
                  </h3>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-sm text-primary hover:underline bg-blue-50 px-2 py-0.5 rounded-md"
                  >
                    {msg.email}
                  </a>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
