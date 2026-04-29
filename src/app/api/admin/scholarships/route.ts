import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET all scholarships
export async function GET() {
  const supabase = createAdminClient()
  const { data: scholarships, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarships })
}

// POST create scholarship
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('scholarships')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarship: data })
}
