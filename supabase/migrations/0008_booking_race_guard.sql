-- Close the double-booking race: if two people request the same book at
-- nearly the same time, accepting one must atomically reject every other
-- pending request for that book and tell those requesters it's already gone.
-- Run in the Supabase SQL Editor after 0007_notification_locale.sql.

create or replace function public.accept_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_book_id uuid;
  v_requester_id uuid;
  v_owner_id uuid;
  v_quantity int;
  v_remaining int;
  v_book_status book_status;
  v_conversation_id uuid;
begin
  select dr.book_id, dr.requester_id, dr.quantity_requested, coalesce(b.donor_id, o.owner_id), b.quantity_available, b.status
  into v_book_id, v_requester_id, v_quantity, v_owner_id, v_remaining, v_book_status
  from public.donation_requests dr
  join public.books b on b.id = dr.book_id
  left join public.organizations o on o.id = b.organization_id
  where dr.id = p_request_id and dr.status = 'pending'
  for update of b;

  if v_owner_id is null or (v_owner_id <> auth.uid() and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  if v_book_status not in ('available', 'requested') then
    raise exception 'BOOK_ALREADY_BOOKED';
  end if;

  update public.donation_requests set status = 'accepted', responded_at = now() where id = p_request_id;

  v_remaining := greatest(coalesce(v_remaining, 0) - v_quantity, 0);
  update public.books set quantity_available = v_remaining, status = case when v_remaining <= 0 then 'reserved' else status end
  where id = v_book_id;

  insert into public.conversations (donation_request_id) values (p_request_id) returning id into v_conversation_id;
  insert into public.conversation_participants (conversation_id, profile_id) values (v_conversation_id, v_requester_id), (v_conversation_id, v_owner_id);

  insert into public.notifications (profile_id, type, title, body, link)
  values (v_requester_id, 'request_accepted', 'Your request was accepted', 'Coordinate the handover in Messages.', '/messages');

  -- Book is fully reserved: whoever else was waiting on it loses the race.
  if v_remaining <= 0 then
    with rejected as (
      update public.donation_requests
      set status = 'rejected', responded_at = now()
      where book_id = v_book_id and status = 'pending' and id <> p_request_id
      returning requester_id
    )
    insert into public.notifications (profile_id, type, title, body, link)
    select requester_id, 'request_rejected', 'This book was already booked', 'Someone else got there first — check other listings nearby.', '/books'
    from rejected;
  end if;
end;
$$;
