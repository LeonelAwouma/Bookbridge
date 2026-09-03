-- BookBridge initial schema
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Idempotent-ish: safe to re-run thanks to IF NOT EXISTS / OR REPLACE guards.

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type user_type as enum ('individual', 'school', 'university', 'library', 'ngo', 'association', 'company', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type organization_type as enum ('school', 'university', 'library', 'ngo', 'association', 'company');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type book_category as enum (
    'primary_school', 'secondary_school', 'university', 'mathematics', 'science', 'physics',
    'chemistry', 'biology', 'literature', 'languages', 'history', 'geography', 'computer_science',
    'engineering', 'medicine', 'business', 'economics', 'law', 'childrens_books', 'dictionaries',
    'encyclopedias', 'exam_preparation', 'professional_books', 'fiction', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type education_level as enum ('preschool', 'primary', 'secondary', 'university', 'professional', 'adult', 'all_levels');
exception when duplicate_object then null; end $$;

do $$ begin
  create type book_condition as enum ('like_new', 'good', 'used', 'heavily_used');
exception when duplicate_object then null; end $$;

do $$ begin
  create type book_status as enum ('available', 'requested', 'reserved', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type need_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type need_status as enum ('open', 'partially_fulfilled', 'fulfilled', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_target_type as enum ('user', 'book', 'message', 'organization', 'book_need');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewed', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'request_received', 'request_accepted', 'request_rejected', 'new_message',
    'donation_completed', 'new_match', 'new_need_nearby', 'achievement_unlocked',
    'org_verified', 'report_update'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.jitter_coordinate(coord double precision, meters int default 1500)
returns double precision
language sql
immutable
as $$
  select case when coord is null then null else
    coord + ((random() - 0.5) * 2 * (meters::double precision / 111000.0))
  end
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  user_type user_type not null default 'individual',
  bio text,
  phone text,
  phone_verified boolean not null default false,
  country text,
  region text,
  city text,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  approx_latitude double precision,
  approx_longitude double precision,
  locale text not null default 'fr',
  is_admin boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  books_donated_count int not null default 0,
  books_received_count int not null default 0,
  donations_completed_count int not null default 0,
  people_supported_count int not null default 0,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  organization_type organization_type not null,
  description text,
  logo_url text,
  country text not null,
  region text,
  city text not null,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  approx_latitude double precision,
  approx_longitude double precision,
  contact_person text,
  contact_email text,
  contact_phone text,
  verification_status verification_status not null default 'unverified',
  books_requested_count int not null default 0,
  books_received_count int not null default 0,
  students_supported_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  author text,
  isbn text,
  category book_category not null default 'other',
  subject text,
  education_level education_level not null default 'all_levels',
  language text not null default 'fr',
  condition book_condition not null default 'good',
  quantity int not null default 1 check (quantity > 0),
  quantity_available int not null default 1 check (quantity_available >= 0),
  description text,
  country text not null,
  region text,
  city text not null,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  approx_latitude double precision,
  approx_longitude double precision,
  pickup_available boolean not null default true,
  dropoff_available boolean not null default false,
  status book_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_donor_or_org check (donor_id is not null or organization_id is not null)
);

create table if not exists public.book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.book_needs (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  category book_category not null default 'other',
  subject text,
  education_level education_level not null default 'all_levels',
  language text not null default 'fr',
  quantity_needed int not null default 1 check (quantity_needed > 0),
  quantity_fulfilled int not null default 0,
  description text,
  priority need_priority not null default 'medium',
  deadline date,
  country text not null,
  region text,
  city text not null,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  approx_latitude double precision,
  approx_longitude double precision,
  status need_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint book_needs_requester_or_org check (requester_id is not null or organization_id is not null)
);

create table if not exists public.donation_requests (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  quantity_requested int not null default 1 check (quantity_requested > 0),
  message text,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  completed_at timestamptz,
  unique (book_id, requester_id, status) deferrable initially immediate
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  donation_request_id uuid references public.donation_requests(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  donation_request_id uuid not null references public.donation_requests(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (donation_request_id, reviewer_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  goal_quantity int not null check (goal_quantity > 0),
  collected_quantity int not null default 0,
  country text not null,
  region text,
  city text not null,
  category book_category,
  education_level education_level,
  image_url text,
  deadline date,
  status campaign_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  donor_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  description text,
  status report_status not null default 'open',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.saved_books (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, book_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  threshold_type text not null,
  threshold_value int not null
);

create table if not exists public.user_achievements (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_books_status on public.books(status);
create index if not exists idx_books_city on public.books(country, city);
create index if not exists idx_books_category on public.books(category);
create index if not exists idx_books_donor on public.books(donor_id);
create index if not exists idx_books_org on public.books(organization_id);
create index if not exists idx_books_created_at on public.books(created_at desc);
create index if not exists idx_book_images_book on public.book_images(book_id);
create index if not exists idx_book_needs_status on public.book_needs(status);
create index if not exists idx_book_needs_city on public.book_needs(country, city);
create index if not exists idx_donation_requests_book on public.donation_requests(book_id);
create index if not exists idx_donation_requests_requester on public.donation_requests(requester_id);
create index if not exists idx_donation_requests_status on public.donation_requests(status);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_notifications_profile on public.notifications(profile_id, is_read, created_at desc);
create index if not exists idx_reviews_reviewee on public.reviews(reviewee_id);
create index if not exists idx_campaigns_org on public.campaigns(organization_id);
create index if not exists idx_saved_books_profile on public.saved_books(profile_id);
create index if not exists idx_organizations_city on public.organizations(country, city);
create index if not exists idx_reports_status on public.reports(status);

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array['profiles','organizations','books','book_needs','donation_requests','campaigns']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- TRIGGERS: coordinate jitter (privacy)
-- ============================================================================

create or replace function public.set_approx_coordinates()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is distinct from old.latitude or new.longitude is distinct from old.longitude or tg_op = 'INSERT' then
    new.approx_latitude := public.jitter_coordinate(new.latitude);
    new.approx_longitude := public.jitter_coordinate(new.longitude);
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','organizations','books','book_needs']
  loop
    execute format('drop trigger if exists jitter_coordinates on public.%I', t);
    execute format('create trigger jitter_coordinates before insert or update on public.%I for each row execute function public.set_approx_coordinates()', t);
  end loop;
end $$;

-- ============================================================================
-- TRIGGER: create profile on signup
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, user_type, country, city, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'user_type')::user_type, 'individual'),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'locale', 'fr')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ADMIN HELPER
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id and profile_id = auth.uid()
  )
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.books enable row level security;
alter table public.book_images enable row level security;
alter table public.book_needs enable row level security;
alter table public.donation_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_donations enable row level security;
alter table public.reports enable row level security;
alter table public.blocked_users enable row level security;
alter table public.saved_books enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- profiles: public read (no precise lat/lng exposed at app layer), self update
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update using (public.is_admin());

-- organizations
drop policy if exists "organizations_select_all" on public.organizations;
create policy "organizations_select_all" on public.organizations for select using (true);
drop policy if exists "organizations_insert_owner" on public.organizations;
create policy "organizations_insert_owner" on public.organizations for insert with check (auth.uid() = owner_id);
drop policy if exists "organizations_update_owner" on public.organizations;
create policy "organizations_update_owner" on public.organizations for update using (auth.uid() = owner_id or public.is_admin());
drop policy if exists "organizations_delete_owner" on public.organizations;
create policy "organizations_delete_owner" on public.organizations for delete using (auth.uid() = owner_id or public.is_admin());

-- books
drop policy if exists "books_select_all" on public.books;
create policy "books_select_all" on public.books for select using (true);
drop policy if exists "books_insert_own" on public.books;
create policy "books_insert_own" on public.books for insert with check (
  donor_id = auth.uid()
  or organization_id in (select id from public.organizations where owner_id = auth.uid())
);
drop policy if exists "books_update_own" on public.books;
create policy "books_update_own" on public.books for update using (
  donor_id = auth.uid()
  or organization_id in (select id from public.organizations where owner_id = auth.uid())
  or public.is_admin()
);
drop policy if exists "books_delete_own" on public.books;
create policy "books_delete_own" on public.books for delete using (
  donor_id = auth.uid()
  or organization_id in (select id from public.organizations where owner_id = auth.uid())
  or public.is_admin()
);

-- book_images: follow parent book ownership
drop policy if exists "book_images_select_all" on public.book_images;
create policy "book_images_select_all" on public.book_images for select using (true);
drop policy if exists "book_images_insert_owner" on public.book_images;
create policy "book_images_insert_owner" on public.book_images for insert with check (
  book_id in (
    select id from public.books
    where donor_id = auth.uid() or organization_id in (select id from public.organizations where owner_id = auth.uid())
  )
);
drop policy if exists "book_images_delete_owner" on public.book_images;
create policy "book_images_delete_owner" on public.book_images for delete using (
  book_id in (
    select id from public.books
    where donor_id = auth.uid() or organization_id in (select id from public.organizations where owner_id = auth.uid())
  )
);

-- book_needs
drop policy if exists "book_needs_select_all" on public.book_needs;
create policy "book_needs_select_all" on public.book_needs for select using (true);
drop policy if exists "book_needs_insert_own" on public.book_needs;
create policy "book_needs_insert_own" on public.book_needs for insert with check (
  requester_id = auth.uid()
  or organization_id in (select id from public.organizations where owner_id = auth.uid())
);
drop policy if exists "book_needs_update_own" on public.book_needs;
create policy "book_needs_update_own" on public.book_needs for update using (
  requester_id = auth.uid()
  or organization_id in (select id from public.organizations where owner_id = auth.uid())
  or public.is_admin()
);
drop policy if exists "book_needs_delete_own" on public.book_needs;
create policy "book_needs_delete_own" on public.book_needs for delete using (
  requester_id = auth.uid()
  or organization_id in (select id from public.organizations where owner_id = auth.uid())
  or public.is_admin()
);

-- donation_requests: visible to requester and book owner
drop policy if exists "donation_requests_select" on public.donation_requests;
create policy "donation_requests_select" on public.donation_requests for select using (
  requester_id = auth.uid()
  or book_id in (
    select id from public.books
    where donor_id = auth.uid() or organization_id in (select id from public.organizations where owner_id = auth.uid())
  )
  or public.is_admin()
);
drop policy if exists "donation_requests_insert" on public.donation_requests;
create policy "donation_requests_insert" on public.donation_requests for insert with check (requester_id = auth.uid());
drop policy if exists "donation_requests_update" on public.donation_requests;
create policy "donation_requests_update" on public.donation_requests for update using (
  requester_id = auth.uid()
  or book_id in (
    select id from public.books
    where donor_id = auth.uid() or organization_id in (select id from public.organizations where owner_id = auth.uid())
  )
  or public.is_admin()
);

-- conversations & participants & messages: participant-only
drop policy if exists "conversations_select" on public.conversations;
create policy "conversations_select" on public.conversations for select using (public.is_conversation_participant(id));
drop policy if exists "conversations_insert" on public.conversations;
create policy "conversations_insert" on public.conversations for insert with check (true);

drop policy if exists "conversation_participants_select" on public.conversation_participants;
create policy "conversation_participants_select" on public.conversation_participants for select using (public.is_conversation_participant(conversation_id));
drop policy if exists "conversation_participants_insert" on public.conversation_participants;
create policy "conversation_participants_insert" on public.conversation_participants for insert with check (profile_id = auth.uid() or true);
drop policy if exists "conversation_participants_update" on public.conversation_participants;
create policy "conversation_participants_update" on public.conversation_participants for update using (profile_id = auth.uid());

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select using (public.is_conversation_participant(conversation_id));
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));

-- reviews: readable by all (builds trust), writable by the reviewer once per request
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert with check (reviewer_id = auth.uid());

-- notifications: strictly own
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (profile_id = auth.uid());
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (profile_id = auth.uid());
drop policy if exists "notifications_insert_system" on public.notifications;
create policy "notifications_insert_system" on public.notifications for insert with check (true);

-- campaigns
drop policy if exists "campaigns_select_all" on public.campaigns;
create policy "campaigns_select_all" on public.campaigns for select using (true);
drop policy if exists "campaigns_insert_owner" on public.campaigns;
create policy "campaigns_insert_owner" on public.campaigns for insert with check (
  organization_id in (select id from public.organizations where owner_id = auth.uid())
);
drop policy if exists "campaigns_update_owner" on public.campaigns;
create policy "campaigns_update_owner" on public.campaigns for update using (
  organization_id in (select id from public.organizations where owner_id = auth.uid()) or public.is_admin()
);

-- campaign_donations
drop policy if exists "campaign_donations_select" on public.campaign_donations;
create policy "campaign_donations_select" on public.campaign_donations for select using (true);
drop policy if exists "campaign_donations_insert_own" on public.campaign_donations;
create policy "campaign_donations_insert_own" on public.campaign_donations for insert with check (donor_id = auth.uid());

-- reports: insert by anyone authenticated, only reporter + admin can read
drop policy if exists "reports_select" on public.reports;
create policy "reports_select" on public.reports for select using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports for insert with check (reporter_id = auth.uid());
drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports for update using (public.is_admin());

-- blocked_users
drop policy if exists "blocked_users_select_own" on public.blocked_users;
create policy "blocked_users_select_own" on public.blocked_users for select using (blocker_id = auth.uid());
drop policy if exists "blocked_users_insert_own" on public.blocked_users;
create policy "blocked_users_insert_own" on public.blocked_users for insert with check (blocker_id = auth.uid());
drop policy if exists "blocked_users_delete_own" on public.blocked_users;
create policy "blocked_users_delete_own" on public.blocked_users for delete using (blocker_id = auth.uid());

-- saved_books
drop policy if exists "saved_books_select_own" on public.saved_books;
create policy "saved_books_select_own" on public.saved_books for select using (profile_id = auth.uid());
drop policy if exists "saved_books_insert_own" on public.saved_books;
create policy "saved_books_insert_own" on public.saved_books for insert with check (profile_id = auth.uid());
drop policy if exists "saved_books_delete_own" on public.saved_books;
create policy "saved_books_delete_own" on public.saved_books for delete using (profile_id = auth.uid());

-- achievements: public read, no client writes
drop policy if exists "achievements_select_all" on public.achievements;
create policy "achievements_select_all" on public.achievements for select using (true);
drop policy if exists "user_achievements_select_all" on public.user_achievements;
create policy "user_achievements_select_all" on public.user_achievements for select using (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('book-images', 'book-images', true), ('org-logos', 'org-logos', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "public_read_book_images" on storage.objects;
create policy "public_read_book_images" on storage.objects for select using (bucket_id in ('book-images', 'org-logos', 'avatars'));

drop policy if exists "auth_upload_own_folder" on storage.objects;
create policy "auth_upload_own_folder" on storage.objects for insert with check (
  bucket_id in ('book-images', 'org-logos', 'avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "auth_delete_own_folder" on storage.objects;
create policy "auth_delete_own_folder" on storage.objects for delete using (
  bucket_id in ('book-images', 'org-logos', 'avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- SEED: achievements catalogue
-- ============================================================================

insert into public.achievements (code, title, description, icon, threshold_type, threshold_value) values
  ('first_donation', 'First Donation', 'Completed your first book donation', 'sparkles', 'books_donated', 1),
  ('ten_books', '10 Books Donated', 'Donated 10 books to the community', 'book-open', 'books_donated', 10),
  ('education_supporter', 'Education Supporter', 'Supported 5 students with books', 'graduation-cap', 'people_supported', 5),
  ('community_hero', 'Community Hero', 'Completed 25 donations', 'heart', 'donations_completed', 25),
  ('school_supporter', 'School Supporter', 'Donated to 3 different schools', 'school', 'schools_supported', 3),
  ('hundred_books', '100 Books Donated', 'Donated 100 books to the community', 'trophy', 'books_donated', 100)
on conflict (code) do nothing;
