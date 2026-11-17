// ============================================================
// SEARCH CONSTANTS — All static data for the filter system
// ============================================================

export const ACADEMIC_LEVELS = [
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Diploma / ITI / Polytechnic',
  'Graduation (UG)',
  'Post-Graduation (PG / Masters)',
]

export const STREAMS = [
  'Science',
  'Commerce',
  'Arts / Humanities',
  'Engineering',
  'Medical',
  'Law',
  'Management',
  'Agriculture',
  'Vocational / Skill Training',
]

export const GENDERS = ['Male', 'Female', 'Transgender', 'Prefer not to say']

export const INCOME_BRACKETS = [
  'Below ₹1L',
  '₹1L to ₹2.5L',
  '₹2.5L to ₹4.5L',
  '₹4.5L to ₹8L',
  'Above ₹8L',
]

export const SCHOLARSHIP_TYPES = [
  'Government Central',
  'Government State',
  'Private / Corporate',
  'NGO / Trust',
]

export const CASTE_CATEGORIES = [
  {
    value: 'General',
    label: 'General',
    tooltip: 'Students not belonging to any reserved category (OBC, SC, ST, etc.)',
  },
  {
    value: 'OBC',
    label: 'OBC',
    tooltip:
      'Other Backward Classes — a constitutionally recognised class of disadvantaged communities in India',
  },
  {
    value: 'SC',
    label: 'SC',
    tooltip:
      'Scheduled Castes — communities historically subjected to caste-based discrimination, listed in the Constitution',
  },
  {
    value: 'ST',
    label: 'ST',
    tooltip: 'Scheduled Tribes — indigenous/tribal communities listed in the Constitution',
  },
  {
    value: 'EBC',
    label: 'EBC',
    tooltip:
      'Extremely Backward Classes — economically and socially backward communities not covered under OBC',
  },
  {
    value: 'EWS',
    label: 'EWS',
    tooltip:
      'Economically Weaker Section — General category families with annual income below ₹8 Lakh',
  },
  {
    value: 'DNT / VJNT',
    label: 'DNT / VJNT',
    tooltip:
      'De-Notified Tribes and Vimukta Jati Nomadic Tribes — communities that were historically "notified" as criminals by British rule',
  },
  {
    value: 'SBC',
    label: 'SBC',
    tooltip:
      'Special Backward Classes — specific backward communities identified by some state governments',
  },
]

export const RELIGIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jain',
  'Parsi / Zoroastrian',
  'No preference',
]

export const SPECIAL_BACKGROUNDS = [
  'First-generation learner',
  'Child of farmer or agricultural family',
  'Child of construction worker',
  'Child of armed forces or martyr',
  'Child of truck or bus driver',
  'Child of unclean occupation worker',
  'Orphan or single parent',
]

export const ACADEMIC_PERFORMANCE_OPTIONS = [
  'Any percentage',
  '50% and above',
  '60% and above',
  '75% and above',
  '80% and above',
  'JEE qualified',
  'NEET qualified',
  'State merit exam qualified',
]

export const AWARD_AMOUNT_RANGES = [
  'Below ₹10,000',
  '₹10,000 to ₹25,000',
  '₹25,000 to ₹50,000',
  '₹50,000 to ₹1 Lakh',
  'Above ₹1 Lakh',
  'Full tuition fee waiver',
]

export const APPLICATION_STATUSES = ['Open', 'Upcoming', 'Both']

export const PORTAL_SOURCES = [
  'NSP (National Scholarship Portal)',
  'State government portal',
  'Corporate or CSR',
  'NGO or Trust',
]

export const STUDY_MODES = [
  { value: 'Regular / Full-time', label: 'Regular / Full-time' },
  {
    value: 'Distance / Correspondence',
    label: 'Distance / Correspondence',
    note: 'Most Indian scholarships exclude distance mode',
  },
  { value: 'Any', label: 'Any' },
]

export const GEOGRAPHIC_FOCUSES = ['State-specific only', 'Central / Pan-India only', 'Both']

export const INSTITUTION_TYPES = [
  'Government college or university',
  'Private college or university',
  'Deemed university',
  'Central university',
  'IIT / NIT / IIIT',
]

export const YEARS_OF_STUDY = [
  '1st year',
  '2nd year',
  '3rd year',
  '4th year',
  'Final year',
  'Not applicable (school students)',
]

export const COLLEGE_PERFORMANCE_OPTIONS = [
  'Any',
  '50% and above',
  '60% and above',
  '75% and above',
  '80% and above',
  'CGPA 6.0 and above',
  'CGPA 7.0 and above',
  'CGPA 8.0 and above',
]

export const APPLICATION_TYPES = ['Fresh applicant', 'Renewal (already receiving)', 'Both']

// Course specialization options dynamically populated based on stream
export const COURSE_SPECIALIZATIONS: Record<string, string[]> = {
  Engineering: ['B.Tech', 'B.E.', 'Diploma Engineering', 'B.Arch'],
  Medical: ['MBBS', 'BDS', 'Nursing', 'Pharmacy', 'Paramedical', 'BAMS', 'BHMS'],
  'Arts / Humanities': [
    'BA',
    'Fine Arts',
    'Music',
    'Social Work',
    'Mass Communication',
    'Psychology',
  ],
  Science: ['B.Sc', 'Integrated M.Sc', 'B.Sc (Hons)'],
  Commerce: ['B.Com', 'BBA', 'B.Com (Hons)'],
  Management: ['MBA', 'PGDM', 'BMS'],
  Law: ['LLB', 'BA LLB', 'BBA LLB', 'LLM'],
  Agriculture: ['B.Sc Agriculture', 'B.Tech Agriculture', 'Veterinary Science'],
}

// All 28 states and 8 Union Territories of India
export const INDIAN_STATES_UTS = [
  // States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

// School levels (for hiding college-specific filters)
export const SCHOOL_LEVELS = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
export const COLLEGE_LEVELS = [
  'Diploma / ITI / Polytechnic',
  'Graduation (UG)',
  'Post-Graduation (PG / Masters)',
]
export const FIRST_YEAR_ONLY = ['1st year', 'Not applicable (school students)']
