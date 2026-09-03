import { createClient } from './server'

export interface ConversationSummary {
  id: string
  donationRequestId: string | null
  bookTitle: string | null
  otherParticipantName: string
  otherParticipantId: string
  lastMessage: string | null
  lastMessageAt: string | null
  unread: boolean
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient()

  const { data: participantRows } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('profile_id', userId)

  if (!participantRows || participantRows.length === 0) return []
  const conversationIds = participantRows.map((r) => r.conversation_id)
  const lastReadByConv = new Map(participantRows.map((r) => [r.conversation_id, r.last_read_at]))

  const [{ data: conversations }, { data: allParticipants }, { data: messages }] = await Promise.all([
    supabase.from('conversations').select('id, donation_request_id, book_id, created_at').in('id', conversationIds),
    supabase.from('conversation_participants').select('conversation_id, profile_id').in('conversation_id', conversationIds),
    supabase.from('messages').select('conversation_id, body, sender_id, created_at').in('conversation_id', conversationIds).order('created_at', { ascending: false }),
  ])

  const requestIds = [...new Set((conversations ?? []).map((c) => c.donation_request_id).filter((v): v is string => !!v))]
  const { data: requests } = requestIds.length
    ? await supabase.from('donation_requests').select('id, book_id').in('id', requestIds)
    : { data: [] }
  const bookIdByRequest = new Map(requests?.map((r) => [r.id, r.book_id]) ?? [])

  const directBookIds = (conversations ?? []).map((c) => c.book_id).filter((v): v is string => !!v)
  const bookIds = [...new Set([...(requests ?? []).map((r) => r.book_id), ...directBookIds])]
  const { data: books } = bookIds.length ? await supabase.from('books').select('id, title').in('id', bookIds) : { data: [] }
  const bookById = new Map((books ?? []).map((b) => [b.id, b.title]))

  const otherProfileIds = new Set<string>()
  const otherByConv = new Map<string, string>()
  for (const p of allParticipants ?? []) {
    if (p.profile_id !== userId) {
      otherByConv.set(p.conversation_id, p.profile_id)
      otherProfileIds.add(p.profile_id)
    }
  }
  const { data: profiles } = otherProfileIds.size
    ? await supabase.from('profiles').select('id, full_name').in('id', [...otherProfileIds])
    : { data: [] }
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))

  const lastMessageByConv = new Map<string, { body: string; created_at: string; sender_id: string }>()
  for (const m of messages ?? []) {
    if (!lastMessageByConv.has(m.conversation_id)) lastMessageByConv.set(m.conversation_id, m)
  }

  return (conversations ?? [])
    .map((c) => {
      const last = lastMessageByConv.get(c.id)
      const lastReadAt = lastReadByConv.get(c.id)
      const otherId = otherByConv.get(c.id) ?? ''
      const bookId = c.book_id ?? (c.donation_request_id ? bookIdByRequest.get(c.donation_request_id) : null)
      return {
        id: c.id,
        donationRequestId: c.donation_request_id,
        bookTitle: bookId ? bookById.get(bookId) ?? null : null,
        otherParticipantName: profileById.get(otherId) ?? 'BookBridge user',
        otherParticipantId: otherId,
        lastMessage: last?.body ?? null,
        lastMessageAt: last?.created_at ?? c.created_at,
        unread: !!last && last.sender_id !== userId && (!lastReadAt || new Date(last.created_at) > new Date(lastReadAt)),
      }
    })
    .sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime())
}

export async function getConversationDetail(conversationId: string, userId: string) {
  const supabase = await createClient()

  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('profile_id', userId)
    .maybeSingle()

  if (!participant) return null

  const [{ data: messages }, { data: participants }, { data: conversation }] = await Promise.all([
    supabase.from('messages').select('id, sender_id, body, created_at').eq('conversation_id', conversationId).order('created_at'),
    supabase.from('conversation_participants').select('profile_id').eq('conversation_id', conversationId),
    supabase.from('conversations').select('book_id, donation_request_id').eq('id', conversationId).single(),
  ])

  const otherId = participants?.find((p) => p.profile_id !== userId)?.profile_id
  const { data: otherProfile } = otherId ? await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', otherId).single() : { data: null }

  let bookId = conversation?.book_id ?? null
  if (!bookId && conversation?.donation_request_id) {
    const { data: request } = await supabase.from('donation_requests').select('book_id').eq('id', conversation.donation_request_id).maybeSingle()
    bookId = request?.book_id ?? null
  }
  const { data: book } = bookId ? await supabase.from('books').select('id, title').eq('id', bookId).maybeSingle() : { data: null }

  await supabase.from('conversation_participants').update({ last_read_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('profile_id', userId)

  return { messages: messages ?? [], otherProfile, bookTitle: book?.title ?? null, bookId: book?.id ?? null }
}
