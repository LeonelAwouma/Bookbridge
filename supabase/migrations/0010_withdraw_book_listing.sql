-- Let a donor withdraw a book listing they no longer want to give away.
-- Mirrors reject_donation_request: any pending requests on the book are
-- atomically rejected and their requesters notified, instead of being left
-- dangling. Run in the Supabase SQL Editor after 0009_book_chat.sql.

create or replace function public.withdraw_book_listing(p_book_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner_id uuid;
  v_status book_status;
begin
  select coalesce(b.donor_id, o.owner_id), b.status
  into v_owner_id, v_status
  from public.books b
  left join public.organizations o on o.id = b.organization_id
  where b.id = p_book_id
  for update of b;

  if v_owner_id is null or (v_owner_id <> auth.uid() and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  if v_status in ('completed', 'cancelled') then
    raise exception 'BOOK_NOT_EDITABLE';
  end if;

  update public.books set status = 'cancelled' where id = p_book_id;

  with rejected as (
    update public.donation_requests
    set status = 'rejected', responded_at = now()
    where book_id = p_book_id and status = 'pending'
    returning requester_id
  )
  insert into public.notifications (profile_id, type, title, body, link)
  select requester_id, 'request_rejected', 'This book was withdrawn', 'The donor withdrew this listing.', '/books'
  from rejected;
end;
$$;
