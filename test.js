const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function test() {
  console.log('Fetching with ANON key...');
  const { data, error } = await supabase.from('scholarships').select('*');
  if (error) {
    console.error('ERROR FETCHING AS ANON:', error);
  } else {
    console.log('ANON FETCH SUCCESS, rows:', data.length);
  }
}
test();
