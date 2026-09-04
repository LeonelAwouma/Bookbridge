-- Let users opt out of transactional emails (new message, request accepted,
-- etc). Defaults to on so existing users keep getting notified. Run in the
-- Supabase SQL Editor after 0010_withdraw_book_listing.sql.

alter table public.profiles add column if not exists email_notifications_enabled boolean not null default true;
