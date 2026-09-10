import { createClient } from './server'
import type { BookCategory, BookNeed, EducationLevel } from './types'

export interface NeedWithExtras extends BookNeed {
  requesterName: string | null
  organizationName: string | null
  organizationVerified: boolean
}

export interface NeedFilters {
  country?: string
  city?: string
  category?: BookCategory
  educationLevel?: EducationLevel
  status?: BookNeed['status'][]
  limit?: number
  requesterId?: string
  organizationId?: string
}

export async function getNeeds(filters: NeedFilters = {}): Promise<NeedWithExtras[]> {
  const supabase = await createClient()
  let query = supabase.from('book_needs').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false }).limit(filters.limit ?? 40)

  query = query.in('status', filters.status ?? ['open', 'partially_fulfilled'])
  if (filters.country) query = query.eq('country', filters.country)
  if (filters.city) query = query.ilike('city', filters.city.trim())
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.educationLevel) query = query.eq('education_level', filters.educationLevel)
  if (filters.requesterId) query = query.eq('requester_id', filters.requesterId)
  if (filters.organizationId) query = query.eq('organization_id', filters.organizationId)

  const { data: needs, error } = await query
  if (error || !needs) return []
  return enrichNeeds(needs)
}

export async function getNeedById(id: string): Promise<NeedWithExtras | null> {
  const supabase = await createClient()
  const { data: need, error } = await supabase.from('book_needs').select('*').eq('id', id).single()
  if (error || !need) return null
  const [enriched] = await enrichNeeds([need])
  return enriched ?? null
}

async function enrichNeeds(needs: BookNeed[]): Promise<NeedWithExtras[]> {
  const supabase = await createClient()
  const requesterIds = [...new Set(needs.map((n) => n.requester_id).filter((v): v is string => !!v))]
  const orgIds = [...new Set(needs.map((n) => n.organization_id).filter((v): v is string => !!v))]

  const [{ data: requesters }, { data: orgs }] = await Promise.all([
    requesterIds.length ? supabase.from('profiles').select('id, full_name').in('id', requesterIds) : Promise.resolve({ data: [] }),
    orgIds.length ? supabase.from('organizations').select('id, name, verification_status').in('id', orgIds) : Promise.resolve({ data: [] }),
  ])

  const requesterById = new Map((requesters ?? []).map((r) => [r.id, r]))
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]))

  return needs.map((need) => {
    const requester = need.requester_id ? requesterById.get(need.requester_id) : undefined
    const org = need.organization_id ? orgById.get(need.organization_id) : undefined
    return {
      ...need,
      requesterName: requester?.full_name ?? null,
      organizationName: org?.name ?? null,
      organizationVerified: org?.verification_status === 'verified',
    }
  })
}
