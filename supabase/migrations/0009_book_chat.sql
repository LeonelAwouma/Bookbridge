-- Let a user open a chat with a book's owner directly from the book page,
-- instead of only after a donation request is accepted. Conversations can
-- now be tied to a book directly (book_id) in addition to a donation
-- request. Run in the Supabase SQL Editor after 0008_booking_race_guard.sql.

alter table public.conversations add column if not exists book_id uuid references public.books(id) on delete set null;
create index if not exists idx_conversations_book on public.conversations(book_id);
