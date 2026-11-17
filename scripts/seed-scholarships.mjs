#!/usr/bin/env node
/**
 * ScholarSearch — Database Seeding Utility
 * 
 * Generates and seeds 120 curated Indian scholarships (UG, PG, Diploma) into Supabase.
 * Uses the Supabase Service Role Key for privileged write access.
 * 
 * Usage:
 *   node scripts/seed-scholarships.mjs
 * Or via npm:
 *   npm run db:seed
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Automatically load .env.local if present and not already defined in environment
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envLocalPath = path.resolve(__dirname, '../.env.local')

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ Error: Missing required environment variables.')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const getRandomDeadline = () => {
  const d = new Date()
  d.setDate(d.getDate() + Math.floor(Math.random() * 120) + 15)
  return d.toISOString().split('T')[0]
}

const UG_SCHOLARSHIPS = [
  'Reliance Foundation Undergraduate Scholarships', 'SBI Platinum Jubilee Asha Scholarship', "HDFC Bank Parivartan's ECSS Programme",
  'Keep India Smiling Foundational Scholarship', 'Kotak Kanya Scholarship', "L'Oréal India For Young Women In Science Scholarship",
  'LIC Golden Jubilee Scholarship', 'ONGC Foundation Scholarship', 'Central Sector Scheme of Scholarship',
  "Prime Minister's Special Scholarship Scheme (PMSSS)", 'Post Matric Scholarship for SC/ST/OBC (UG)', 'Ishan Uday Special Scholarship for NER',
  'AICTE Pragati Scholarship for Girls (UG)', 'AICTE Saksham Scholarship (UG)', 'AICTE Swanath Scholarship (UG)',
  'Tata Trust Medical and Healthcare Scholarship', "Dr. Reddy's Foundation Sashakt Scholarship", "Santoor Women's Scholarship",
  'Vidyadhan Scholarship (UG)', 'Fair and Lovely Foundation Scholarship', 'Panasonic Ratti Chhatr Scholarship',
  'Legrand Scholarship (UG)', 'Rolls-Royce Unnati Scholarship', 'Siemens Scholarship (UG)',
  'G.P. Birla Educational Foundation Scholarship', 'Sitaram Jindal Foundation Scholarship (UG)', 'Nirankari Rajmata Scholarship',
  'Yashad-Sumedha Scholarship', 'Sensodyne IDA Shining Star Scholarship', 'Buddy4Study UG Scholarship',
  'M-Scholarship by Magma Fincorp', 'Malabar Charitable Trust Scholarship', 'NSDL Shiksha Sahyog Scholarship (UG)',
  'Muthoot M George Higher Education Scholarship', 'R.D. Sethna Loan Scholarship', 'Shahani Academic Scholarship',
  'Begum Hazrat Mahal National Scholarship', 'Foundation for Excellence (FFE) Scholarship', 'SOF Girl Child Scholarship Scheme',
  'Schindler Igniting Minds Scholarship (UG)'
]

const PG_SCHOLARSHIPS = [
  'Post-Graduate Indira Gandhi Scholarship for Single Girl Child', 'Post-Graduate Merit Scholarship for University Rank Holders',
  'AICTE PG (GATE/GPAT) Scholarship', 'UGC NET Junior Research Fellowship', 'CSIR NET Fellowship',
  'ONGC Foundation PG Scholarship', "HDFC Bank Parivartan's ECSS PG Programme", 'S.N. Bose Scholars Program',
  'Tata Trust PG Scholarship', 'Narotam Sekhsaria Scholarship', 'K.C. Mahindra Scholarships for Post-Graduate Studies',
  'J.N. Tata Endowment Loan Scholarship', 'Lady Meherbai D. Tata Education Trust Scholarship', 'Inlaks Shivdasani Foundation Scholarship',
  'Aga Khan Foundation International Scholarship', 'Commonwealth Master’s Scholarships', 'Chevening Scholarships (India)',
  'Felix Scholarships', "Fulbright-Nehru Master's Fellowships", 'Erasmus Mundus Joint Master Degrees (India)',
  'Great Scholarships India', 'Charpak Master’s Program', 'Eiffel Excellence Scholarship Program',
  'DAAD Scholarships for India', 'National Overseas Scholarship for SC/ST', 'Dr. Ambedkar Scheme of Interest Subsidy',
  'Maulana Azad National Fellowship for Minority Students', 'National Fellowship for OBC', 'Post Matric Scholarship for Minorities (PG)',
  'Swami Vivekananda Merit-cum-Means Scholarship (PG)', 'MahaDBT Post Matric Scholarship (PG)', 'UP Post Matric Scholarship for PG',
  'Ratan Tata Trust Scholarship', 'Sitaram Jindal Foundation PG Scholarship', 'Fair and Lovely PG Scholarship',
  "L'Oréal India PG Scholarship", 'Reliance Foundation PG Scholarship', 'SBI Asha PG Scholarship',
  'Muthoot M George PG Scholarship', 'Schindler PG Scholarship'
]

const DIPLOMA_SCHOLARSHIPS = [
  'AICTE Pragati Scholarship for Diploma', 'AICTE Saksham Scholarship for Diploma', 'Keep India Smiling Foundational Scholarship for ITI',
  'Keep India Smiling Foundational Scholarship for Diploma', "HDFC Bank Parivartan's ECSS for Diploma", "HDFC Bank Parivartan's ECSS for ITI",
  'LIC Golden Jubilee Scholarship for Diploma', 'ONGC Foundation Scholarship for Diploma', 'Kotak Shiksha Nidhi (Diploma)',
  'Post Matric Scholarship for Diploma Students (NSP)', 'Post Matric Scholarship for ITI Students (NSP)', 'Tata Trust Diploma Scholarship',
  'Vidyadhan Scholarship for Diploma', "Santoor Women's Scholarship for Diploma", 'Panasonic Ratti Chhatr Scholarship for Diploma',
  'Legrand Scholarship for Diploma', 'Rolls-Royce Unnati Scholarship for Diploma', 'Siemens Scholarship for Diploma',
  'Sitaram Jindal Foundation Scholarship for Diploma', 'Sitaram Jindal Foundation Scholarship for ITI', 'Nirankari Rajmata Scholarship for Diploma',
  'Yashad-Sumedha Scholarship for Diploma', 'Sensodyne IDA Shining Star Scholarship for Diploma', 'Buddy4Study Diploma Scholarship',
  'M-Scholarship by Magma Fincorp for Diploma', 'Malabar Charitable Trust Scholarship for Diploma', 'NSDL Shiksha Sahyog Scholarship for Diploma',
  'Muthoot M George Higher Education Scholarship for Diploma', 'R.D. Sethna Loan Scholarship for Diploma', 'Shahani Academic Scholarship for Diploma',
  'Begum Hazrat Mahal National Scholarship for Diploma', 'FFE Scholarship for Diploma', 'Schindler Igniting Minds Scholarship for Diploma',
  'Schindler Igniting Minds Scholarship for ITI', 'PMKVY Financial Support', 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
  'State Level Polytechnic Scholarships (MahaDBT)', 'State Level ITI Scholarships (UP)', 'National Means Cum Merit Scholarship (Diploma)',
  'Swami Vivekananda Merit-cum-Means Scholarship for Diploma'
]

const generateScholarship = (title, levelType) => {
  const isGovt = title.includes('Scheme') || title.includes('National') || title.includes('AICTE') || title.includes('UGC')
  const scholarshipType = isGovt ? (Math.random() > 0.5 ? 'Government Central' : 'Government State') : 'Private / Corporate'
  const category = isGovt ? 'Government' : (Math.random() > 0.5 ? 'Merit' : 'Need-based')
  
  const providers = {
    'Private / Corporate': ['HDFC Bank', 'Reliance Foundation', 'Tata Trusts', 'SBI Foundation', 'ONGC Foundation', 'LIC India'],
    'Government Central': ['Ministry of Education', 'AICTE', 'UGC', 'Ministry of Social Justice'],
    'Government State': ['State Department of Higher Education', 'State Minorities Welfare Department']
  }

  const states = ['All India', 'All India', 'All India', 'Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Delhi']
  
  let academicLevelStr = ''
  if (levelType === 'UG') academicLevelStr = 'Graduation (UG)'
  else if (levelType === 'PG') academicLevelStr = 'Post-Graduation (PG / Masters)'
  else academicLevelStr = 'Diploma / ITI / Polytechnic'

  return {
    title,
    provider: isGovt ? providers[scholarshipType][Math.floor(Math.random() * providers[scholarshipType].length)] : providers['Private / Corporate'][Math.floor(Math.random() * providers['Private / Corporate'].length)],
    category,
    country: 'India',
    state: states[Math.floor(Math.random() * states.length)],
    min_marks_percentage: Math.floor(Math.random() * 40) + 50,
    amount: levelType === 'PG' ? Math.floor(Math.random() * 100000) + 50000 : Math.floor(Math.random() * 50000) + 10000,
    currency: 'INR',
    deadline: getRandomDeadline(),
    description: `The ${title} provides financial assistance to meritorious and needy students pursuing ${levelType} studies. This initiative aims to support students who face financial challenges in completing their education.`,
    eligibility_criteria: `- Must be enrolled in a full-time ${levelType} program.\n- Minimum ${Math.floor(Math.random() * 40) + 50}% marks in previous qualifying exam.\n- Annual family income must be less than ₹${Math.floor(Math.random() * 5) + 3} Lakhs.`,
    application_link: 'https://scholarships.gov.in',
    tags: [levelType, category, 'Merit-based', 'Need-based'],
    is_active: true,
    academic_levels: [academicLevelStr],
    streams: ['All', 'Engineering', 'Medical', 'Science', 'Commerce', 'Arts / Humanities'].sort(() => 0.5 - Math.random()).slice(0, 3),
    gender_eligibility: title.includes('Girl') || title.includes('Women') || title.includes('Kanya') ? 'Female' : 'All',
    income_range: ['Below ₹1L', '₹1L to ₹2.5L', '₹2.5L to ₹4.5L', '₹4.5L to ₹8L', 'Above ₹8L', 'Not specified'][Math.floor(Math.random() * 6)],
    caste_categories: ['General', 'OBC', 'SC', 'ST', 'EWS'].sort(() => 0.5 - Math.random()).slice(0, 3),
    religion: 'Any',
    disability_required: title.includes('Saksham') || title.includes('Disabled'),
    girls_only: title.includes('Girl') || title.includes('Women') || title.includes('Kanya'),
    special_backgrounds: [],
    min_academic_performance: '60% and above',
    award_amount_range: levelType === 'PG' ? 'Above ₹1 Lakh' : '₹25,000 to ₹50,000',
    application_status: 'Open',
    portal_source: isGovt ? ['NSP (National Scholarship Portal)'] : ['Buddy4Study', 'Foundation Direct Portal'],
    course_specializations: ['Computer Science', 'Mechanical', 'Finance', 'Economics', 'General'].sort(() => 0.5 - Math.random()).slice(0, 2),
    study_mode: 'Full-time',
    geographic_focus: 'National',
    institution_types: ['Government', 'Private', 'NIT / IIT / IIIT'],
    year_of_study: 'Any Year',
    application_type: 'Fresh',
    min_college_performance: 'Any',
    scholarship_type: scholarshipType
  }
}

async function run() {
  console.log('🚀 Generating 120 curated Indian scholarships...')
  
  const allScholarships = [
    ...UG_SCHOLARSHIPS.map(t => generateScholarship(t, 'UG')),
    ...PG_SCHOLARSHIPS.map(t => generateScholarship(t, 'PG')),
    ...DIPLOMA_SCHOLARSHIPS.map(t => generateScholarship(t, 'DIPLOMA'))
  ]

  console.log(`📦 Upserting ${allScholarships.length} scholarships into Supabase...`)

  const { error } = await supabase
    .from('scholarships')
    .upsert(allScholarships, { onConflict: 'title' })

  if (error) {
    console.error('❌ Error inserting scholarships:', error.message)
    process.exit(1)
  }

  console.log('✅ Successfully seeded scholarships into the database!')
}

run()
