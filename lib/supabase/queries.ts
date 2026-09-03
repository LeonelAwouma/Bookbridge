import { createClient } from './server'
import type { Profile } from './types'

export async function getCurrentUserAndProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()

  return { user, profile }
}

export async function getUnreadNotificationCount(profileId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('is_read', false)

  return count ?? 0
}
