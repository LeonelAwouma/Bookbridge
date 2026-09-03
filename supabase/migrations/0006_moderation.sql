-- Enforce admin blocking: a blocked user can no longer create new listings,
-- needs, requests, or messages. Run in the Supabase SQL Editor after the
-- previous migrations.

create or replace function public.is_blocked()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_blocked from public.profiles where id = auth.uid()), false)
$$;

drop policy if exists "books_insert_own" on public.books;
create policy "books_insert_own" on public.books for insert with check (
  not public.is_blocked() and (
    donor_id = auth.uid()
    or organization_id in (select id from public.organizations where owner_id = auth.uid())
  )
);

drop policy if exists "book_needs_insert_own" on public.book_needs;
create policy "book_needs_insert_own" on public.book_needs for insert with check (
  not public.is_blocked() and (
    requester_id = auth.uid()
    or organization_id in (select id from public.organizations where owner_id = auth.uid())
  )
);

drop policy if exists "donation_requests_insert" on public.donation_requests;
create policy "donation_requests_insert" on public.donation_requests for insert with check (
  not public.is_blocked() and requester_id = auth.uid()
);

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (
  not public.is_blocked() and sender_id = auth.uid() and public.is_conversation_participant(conversation_id)
);
