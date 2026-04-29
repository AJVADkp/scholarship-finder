const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing with ANON key...');
  const { data, error } = await supabase.from('scholarships').select('*');
  console.log('Data count:', data ? data.length : 0);
  if (error) console.error('Error:', error);
}

test()
