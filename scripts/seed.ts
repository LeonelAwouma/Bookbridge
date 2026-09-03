// Realistic demo data for BookBridge.
// Requires the SQL migrations (supabase/migrations/*.sql) to already be applied.
// Run with: pnpm seed

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })
import type { Database } from '../lib/supabase/types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient<Database>(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

interface DemoUser {
  email: string
  fullName: string
  userType: 'individual' | 'school' | 'university' | 'library' | 'ngo' | 'association' | 'company'
  country: string
  region: string
  city: string
  neighborhood: string
  lat: number
  lng: number
  bio: string
}

const demoUsers: DemoUser[] = [
  { email: 'amelie.ngono@example.com', fullName: 'Amélie Ngono', userType: 'individual', country: 'Cameroon', region: 'Littoral', city: 'Douala', neighborhood: 'Bonapriso', lat: 4.0335, lng: 9.7089, bio: 'Former literature student, always passing books on.' },
  { email: 'david.kamau@example.com', fullName: 'David Kamau', userType: 'individual', country: 'Kenya', region: 'Nairobi County', city: 'Nairobi', neighborhood: 'Kilimani', lat: 1.2921, lng: 36.8219, bio: 'Software engineer, donates old textbooks every semester.' },
  { email: 'fatou.diop@example.com', fullName: 'Fatou Diop', userType: 'individual', country: 'Senegal', region: 'Dakar', city: 'Dakar', neighborhood: 'Mermoz', lat: 14.7167, lng: -17.4677, bio: 'Teacher supporting local primary schools.' },
  { email: 'kofi.asante@example.com', fullName: 'Kofi Asante', userType: 'individual', country: 'Ghana', region: 'Greater Accra', city: 'Accra', neighborhood: 'Osu', lat: 5.6037, lng: -0.187, bio: 'University graduate, engineering background.' },
  { email: 'aya.kone@example.com', fullName: 'Aya Koné', userType: 'individual', country: "Côte d'Ivoire", region: 'Abidjan', city: 'Abidjan', neighborhood: 'Cocody', lat: 5.3599, lng: -4.0083, bio: 'Parent of two, clearing out the family bookshelf.' },
  { email: 'jean.mbarga@example.com', fullName: 'Jean Mbarga', userType: 'individual', country: 'Cameroon', region: 'Centre', city: 'Yaoundé', neighborhood: 'Bastos', lat: 3.8895, lng: 11.5211, bio: 'Retired civil servant, avid reader.' },
  { email: 'grace.uwase@example.com', fullName: 'Grace Uwase', userType: 'individual', country: 'Rwanda', region: 'Kigali City', city: 'Kigali', neighborhood: 'Kacyiru', lat: -1.9441, lng: 30.0619, bio: 'Recent university graduate in public health.' },
  { email: 'chidi.okafor@example.com', fullName: 'Chidi Okafor', userType: 'individual', country: 'Nigeria', region: 'Lagos State', city: 'Lagos', neighborhood: 'Yaba', lat: 6.5158, lng: 3.3707, bio: 'Bookstore owner donating surplus stock.' },
  { email: 'lycee.douala@example.com', fullName: 'Lycée Bilingue de Bonanjo', userType: 'school', country: 'Cameroon', region: 'Littoral', city: 'Douala', neighborhood: 'Bonanjo', lat: 4.0483, lng: 9.6987, bio: 'Public secondary school serving over 1,200 students.' },
  { email: 'library.nairobi@example.com', fullName: 'Eastlands Community Library', userType: 'library', country: 'Kenya', region: 'Nairobi County', city: 'Nairobi', neighborhood: 'Eastlands', lat: 1.2833, lng: 36.85, bio: 'Free community library and reading room.' },
  { email: 'ngo.dakar@example.com', fullName: 'Lire Ensemble Sénégal', userType: 'ngo', country: 'Senegal', region: 'Dakar', city: 'Dakar', neighborhood: 'Plateau', lat: 14.6708, lng: -17.4313, bio: 'NGO promoting literacy in underserved neighborhoods.' },
  { email: 'univ.accra@example.com', fullName: 'Accra Community College', userType: 'university', country: 'Ghana', region: 'Greater Accra', city: 'Accra', neighborhood: 'Legon', lat: 5.65, lng: -0.1865, bio: 'Two-year college focused on vocational education.' },
]

const bookCatalog = [
  { title: 'Things Fall Apart', author: 'Chinua Achebe', category: 'fiction', level: 'secondary', subject: 'Literature' },
  { title: 'The River Between', author: 'Ngũgĩ wa Thiong’o', category: 'fiction', level: 'secondary', subject: 'Literature' },
  { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', category: 'fiction', level: 'secondary', subject: 'Literature' },
  { title: 'Mathematics Form 4', author: 'Longhorn Publishers', category: 'mathematics', level: 'secondary', subject: 'Algebra' },
  { title: 'Introduction to Biology', author: 'M. N. Sadiku', category: 'science', level: 'secondary', subject: 'Biology' },
  { title: 'Principles of Economics', author: 'N. Gregory Mankiw', category: 'economics', level: 'university', subject: 'Economics' },
  { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'computer_science', level: 'university', subject: 'Computer Science' },
  { title: 'Organic Chemistry Basics', author: 'Paula Bruice', category: 'chemistry', level: 'secondary', subject: 'Chemistry' },
  { title: 'A History of West Africa', author: 'J.F. Ade Ajayi', category: 'history', level: 'secondary', subject: 'History' },
  { title: 'French Grammar Workbook', author: 'Éditions Hatier', category: 'languages', level: 'primary', subject: 'French' },
  { title: 'English for Beginners', author: 'Oxford University Press', category: 'languages', level: 'primary', subject: 'English' },
  { title: 'Concise Oxford Dictionary', author: 'Oxford University Press', category: 'dictionaries', level: 'all_levels', subject: null },
  { title: 'Fundamentals of Physics', author: 'Halliday & Resnick', category: 'physics', level: 'secondary', subject: 'Physics' },
  { title: 'Business Law Essentials', author: 'Henry Cheeseman', category: 'law', level: 'university', subject: 'Law' },
  { title: 'Clinical Medicine Handbook', author: 'Kumar & Clark', category: 'medicine', level: 'university', subject: 'Medicine' },
  { title: 'Children’s Picture Atlas', author: 'National Geographic Kids', category: 'childrens_books', level: 'preschool', subject: null },
  { title: 'BEPC Exam Preparation Guide', author: 'Editions du Flamboyant', category: 'exam_preparation', level: 'secondary', subject: null },
  { title: 'Engineering Mechanics', author: 'R.C. Hibbeler', category: 'engineering', level: 'university', subject: 'Mechanics' },
  { title: 'World Geography Atlas', author: 'National Geographic', category: 'geography', level: 'secondary', subject: 'Geography' },
  { title: 'Professional Accounting Standards', author: 'IFRS Foundation', category: 'professional_books', level: 'professional', subject: 'Accounting' },
] as const

const needsCatalog = [
  { title: 'Secondary school mathematics books', category: 'mathematics', level: 'secondary', quantity: 25, priority: 'high' },
  { title: 'Primary school French readers', category: 'languages', level: 'primary', quantity: 12, priority: 'medium' },
  { title: 'Computer science basics for students', category: 'computer_science', level: 'university', quantity: 5, priority: 'low' },
  { title: 'Science textbooks for exam preparation', category: 'science', level: 'secondary', quantity: 18, priority: 'high' },
  { title: "Children's picture books", category: 'childrens_books', level: 'preschool', quantity: 30, priority: 'medium' },
  { title: 'English language dictionaries', category: 'dictionaries', level: 'all_levels', quantity: 10, priority: 'low' },
] as const

function condition(i: number) {
  return (['like_new', 'good', 'used', 'heavily_used'] as const)[i % 4]
}

async function main() {
  console.log('Seeding BookBridge demo data...')

  const profileIds: Record<string, string> = {}

  for (const u of demoUsers) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing.users.find((x) => x.email === u.email)
    let userId = found?.id

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'BookBridge2026!',
        email_confirm: true,
        user_metadata: { full_name: u.fullName, user_type: u.userType, country: u.country, city: u.city, locale: 'fr' },
      })
      if (error || !data.user) {
        console.error(`Failed to create ${u.email}:`, error?.message)
        continue
      }
      userId = data.user.id
    }

    profileIds[u.email] = userId

    await supabase
      .from('profiles')
      .update({ region: u.region, neighborhood: u.neighborhood, latitude: u.lat, longitude: u.lng, bio: u.bio })
      .eq('id', userId)
  }

  console.log(`Created/verified ${Object.keys(profileIds).length} demo profiles.`)

  const orgOwners: [string, string][] = [
    ['lycee.douala@example.com', 'Lycée Bilingue de Bonanjo'],
    ['library.nairobi@example.com', 'Eastlands Community Library'],
    ['ngo.dakar@example.com', 'Lire Ensemble Sénégal'],
    ['univ.accra@example.com', 'Accra Community College'],
  ]
  const orgTypeByEmail: Record<string, 'school' | 'library' | 'ngo' | 'university'> = {
    'lycee.douala@example.com': 'school',
    'library.nairobi@example.com': 'library',
    'ngo.dakar@example.com': 'ngo',
    'univ.accra@example.com': 'university',
  }

  const orgIds: Record<string, string> = {}

  for (const [email, name] of orgOwners) {
    const ownerId = profileIds[email]
    if (!ownerId) continue
    const user = demoUsers.find((u) => u.email === email)!

    const { data: existingOrg } = await supabase.from('organizations').select('id').eq('owner_id', ownerId).maybeSingle()
    if (existingOrg) {
      orgIds[email] = existingOrg.id
      continue
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        owner_id: ownerId,
        name,
        organization_type: orgTypeByEmail[email],
        description: user.bio,
        country: user.country,
        region: user.region,
        city: user.city,
        neighborhood: user.neighborhood,
        latitude: user.lat,
        longitude: user.lng,
        contact_person: user.fullName,
        contact_email: email,
        verification_status: email === 'lycee.douala@example.com' ? 'verified' : 'unverified',
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Failed to create organization ${name}:`, error.message)
      continue
    }
    orgIds[email] = data.id
  }

  console.log(`Created/verified ${Object.keys(orgIds).length} organizations.`)

  const individualEmails = demoUsers.filter((u) => u.userType === 'individual').map((u) => u.email)
  const { data: existingBooks } = await supabase.from('books').select('id').limit(1)

  if (!existingBooks || existingBooks.length === 0) {
    let created = 0
    for (let i = 0; i < bookCatalog.length; i++) {
      const book = bookCatalog[i]
      const donorEmail = individualEmails[i % individualEmails.length]
      const donorId = profileIds[donorEmail]
      const donor = demoUsers.find((u) => u.email === donorEmail)!
      if (!donorId) continue

      const { error } = await supabase.from('books').insert({
        donor_id: donorId,
        title: book.title,
        author: book.author,
        category: book.category,
        subject: book.subject,
        education_level: book.level,
        language: 'fr',
        condition: condition(i),
        quantity: 1 + (i % 3),
        quantity_available: 1 + (i % 3),
        description: `Donated by ${donor.fullName}. In ${condition(i).replace('_', ' ')} condition.`,
        country: donor.country,
        region: donor.region,
        city: donor.city,
        neighborhood: donor.neighborhood,
        latitude: donor.lat,
        longitude: donor.lng,
        pickup_available: true,
        dropoff_available: i % 3 === 0,
      })
      if (error) console.error(`Failed to create book ${book.title}:`, error.message)
      else created++
    }
    console.log(`Created ${created} book listings.`)
  } else {
    console.log('Books already exist, skipping book seeding.')
  }

  const { data: existingNeeds } = await supabase.from('book_needs').select('id').limit(1)
  if (!existingNeeds || existingNeeds.length === 0) {
    let created = 0
    for (let i = 0; i < needsCatalog.length; i++) {
      const need = needsCatalog[i]
      const [orgEmail] = orgOwners[i % orgOwners.length]
      const orgId = orgIds[orgEmail]
      const owner = demoUsers.find((u) => u.email === orgEmail)!
      if (!orgId) continue

      const { error } = await supabase.from('book_needs').insert({
        organization_id: orgId,
        title: need.title,
        category: need.category,
        education_level: need.level,
        language: 'fr',
        quantity_needed: need.quantity,
        priority: need.priority,
        description: `Requested to support students at ${owner.fullName}.`,
        country: owner.country,
        region: owner.region,
        city: owner.city,
        neighborhood: owner.neighborhood,
        latitude: owner.lat,
        longitude: owner.lng,
      })
      if (error) console.error(`Failed to create need ${need.title}:`, error.message)
      else created++
    }
    console.log(`Created ${created} book needs.`)
  } else {
    console.log('Book needs already exist, skipping.')
  }

  const { data: existingCampaigns } = await supabase.from('campaigns').select('id').limit(1)
  if (!existingCampaigns || existingCampaigns.length === 0) {
    const schoolOrgId = orgIds['lycee.douala@example.com']
    const ngoOrgId = orgIds['ngo.dakar@example.com']

    if (schoolOrgId) {
      await supabase.from('campaigns').insert({
        organization_id: schoolOrgId,
        title: '1,000 Books for Rural Schools',
        description: 'Help us equip five rural secondary schools around Douala with up-to-date textbooks.',
        goal_quantity: 1000,
        collected_quantity: 620,
        country: 'Cameroon',
        city: 'Douala',
        category: 'secondary_school',
      })
    }
    if (ngoOrgId) {
      await supabase.from('campaigns').insert({
        organization_id: ngoOrgId,
        title: 'Literacy for Every Child',
        description: "Building children's book corners in ten community centers across Dakar.",
        goal_quantity: 500,
        collected_quantity: 145,
        country: 'Senegal',
        city: 'Dakar',
        category: 'childrens_books',
      })
    }
    console.log('Created demo campaigns.')
  } else {
    console.log('Campaigns already exist, skipping.')
  }

  console.log('Seeding complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
