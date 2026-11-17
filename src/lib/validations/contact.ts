import { z } from 'zod'

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Valid email is required').max(255, 'Email cannot exceed 255 characters'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000, 'Message cannot exceed 2000 characters'),
  // Anti-bot honeypot field: must remain empty when filled by human users
  website_url: z.string().max(200).optional().default(''),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
