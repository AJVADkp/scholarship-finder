import { z } from 'zod'

export const trackEventSchema = z.object({
  page: z.string().trim().min(1, 'Page path is required').max(500),
  referrer: z.string().trim().max(1000).nullable().optional(),
  device: z.string().trim().max(100).nullable().optional(),
  os: z.string().trim().max(100).nullable().optional(),
  browser: z.string().trim().max(100).nullable().optional(),
  screen_width: z.coerce.number().int().min(0).max(15000).nullable().optional(),
  screen_height: z.coerce.number().int().min(0).max(15000).nullable().optional(),
})

export type TrackEventInput = z.infer<typeof trackEventSchema>
