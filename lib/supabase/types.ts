// Hand-written types mirroring supabase/migrations/0001_init.sql
// (no Supabase CLI access in this environment to auto-generate them)

export type UserType = 'individual' | 'school' | 'university' | 'library' | 'ngo' | 'association' | 'company' | 'admin'
export type OrganizationType = 'school' | 'university' | 'library' | 'ngo' | 'association' | 'company'
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type BookCategory =
  | 'primary_school' | 'secondary_school' | 'university' | 'mathematics' | 'science' | 'physics'
  | 'chemistry' | 'biology' | 'literature' | 'languages' | 'history' | 'geography'
  | 'computer_science' | 'engineering' | 'medicine' | 'business' | 'economics' | 'law'
  | 'childrens_books' | 'dictionaries' | 'encyclopedias' | 'exam_preparation' | 'professional_books'
  | 'fiction' | 'other'
export type EducationLevel = 'preschool' | 'primary' | 'secondary' | 'university' | 'professional' | 'adult' | 'all_levels'
export type BookCondition = 'like_new' | 'good' | 'used' | 'heavily_used'
export type BookStatus = 'available' | 'requested' | 'reserved' | 'completed' | 'cancelled'
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
export type NeedPriority = 'low' | 'medium' | 'high'
export type NeedStatus = 'open' | 'partially_fulfilled' | 'fulfilled' | 'closed'
export type ReportTargetType = 'user' | 'book' | 'message' | 'organization' | 'book_need'
export type ReportStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed'
export type NotificationType =
  | 'request_received' | 'request_accepted' | 'request_rejected' | 'new_message'
  | 'donation_completed' | 'new_match' | 'new_need_nearby' | 'achievement_unlocked'
  | 'org_verified' | 'report_update'
export type CampaignStatus = 'active' | 'completed' | 'cancelled'

export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  user_type: UserType
  bio: string | null
  phone: string | null
  phone_verified: boolean
  country: string | null
  region: string | null
  city: string | null
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  approx_latitude: number | null
  approx_longitude: number | null
  locale: string
  is_admin: boolean
  rating_avg: number
  rating_count: number
  books_donated_count: number
  books_received_count: number
  donations_completed_count: number
  people_supported_count: number
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export type Organization = {
  id: string
  owner_id: string
  name: string
  organization_type: OrganizationType
  description: string | null
  logo_url: string | null
  country: string
  region: string | null
  city: string
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  approx_latitude: number | null
  approx_longitude: number | null
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  verification_status: VerificationStatus
  books_requested_count: number
  books_received_count: number
  students_supported_count: number
  created_at: string
  updated_at: string
}

export type Book = {
  id: string
  donor_id: string | null
  organization_id: string | null
  title: string
  author: string | null
  isbn: string | null
  category: BookCategory
  subject: string | null
  education_level: EducationLevel
  language: string
  condition: BookCondition
  quantity: number
  quantity_available: number
  description: string | null
  country: string
  region: string | null
  city: string
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  approx_latitude: number | null
  approx_longitude: number | null
  pickup_available: boolean
  dropoff_available: boolean
  status: BookStatus
  created_at: string
  updated_at: string
}

export type BookImage = {
  id: string
  book_id: string
  url: string
  position: number
  created_at: string
}

export type BookNeed = {
  id: string
  requester_id: string | null
  organization_id: string | null
  title: string
  category: BookCategory
  subject: string | null
  education_level: EducationLevel
  language: string
  quantity_needed: number
  quantity_fulfilled: number
  description: string | null
  priority: NeedPriority
  deadline: string | null
  country: string
  region: string | null
  city: string
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  approx_latitude: number | null
  approx_longitude: number | null
  status: NeedStatus
  created_at: string
  updated_at: string
}

export type DonationRequest = {
  id: string
  book_id: string
  requester_id: string
  quantity_requested: number
  message: string | null
  status: RequestStatus
  created_at: string
  updated_at: string
  responded_at: string | null
  completed_at: string | null
}

export type Conversation = {
  id: string
  donation_request_id: string | null
  created_at: string
}

export type ConversationParticipant = {
  conversation_id: string
  profile_id: string
  last_read_at: string | null
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

export type Review = {
  id: string
  donation_request_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type Notification = {
  id: string
  profile_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export type Campaign = {
  id: string
  organization_id: string
  title: string
  description: string | null
  goal_quantity: number
  collected_quantity: number
  country: string
  region: string | null
  city: string
  category: BookCategory | null
  education_level: EducationLevel | null
  image_url: string | null
  deadline: string | null
  status: CampaignStatus
  created_at: string
  updated_at: string
}

export type CampaignDonation = {
  id: string
  campaign_id: string
  donor_id: string
  book_id: string | null
  quantity: number
  created_at: string
}

export type Report = {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  description: string | null
  status: ReportStatus
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export type BlockedUser = {
  blocker_id: string
  blocked_id: string
  created_at: string
}

export type SavedBook = {
  profile_id: string
  book_id: string
  created_at: string
}

export type Achievement = {
  id: string
  code: string
  title: string
  description: string
  icon: string
  threshold_type: string
  threshold_value: number
}

export type UserAchievement = {
  profile_id: string
  achievement_id: string
  earned_at: string
}

type TableDef<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      organizations: TableDef<Organization>
      books: TableDef<Book>
      book_images: TableDef<BookImage>
      book_needs: TableDef<BookNeed>
      donation_requests: TableDef<DonationRequest>
      conversations: TableDef<Conversation>
      conversation_participants: TableDef<ConversationParticipant>
      messages: TableDef<Message>
      reviews: TableDef<Review>
      notifications: TableDef<Notification>
      campaigns: TableDef<Campaign>
      campaign_donations: TableDef<CampaignDonation>
      reports: TableDef<Report>
      blocked_users: TableDef<BlockedUser>
      saved_books: TableDef<SavedBook>
      achievements: TableDef<Achievement>
      user_achievements: TableDef<UserAchievement>
    }
    Views: Record<string, never>
    Functions: {
      accept_donation_request: { Args: { p_request_id: string }; Returns: void }
      reject_donation_request: { Args: { p_request_id: string }; Returns: void }
      complete_donation_request: { Args: { p_request_id: string }; Returns: void }
      cancel_donation_request: { Args: { p_request_id: string }; Returns: void }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
