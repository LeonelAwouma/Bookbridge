-- BookBridge donation request workflow: triggers + SECURITY DEFINER RPCs
-- Run in the Supabase SQL Editor AFTER 0001_init.sql.

-- Requesters may only cancel their own pending request directly; every other
-- transition (accept/reject/complete) must go through the RPC functions below
-- so ownership is verified server-side instead of trusted to RLS alone.
drop policy if exists "donation_requests_update" on public.donation_requests;
create policy "donation_requests_update" on public.donation_requests for update
  using (requester_id = auth.uid())
  with check (requester_id = auth.uid() and status = 'cancelled');

-- ============================================================================
-- New request -> flip book to "requested" + notify the owner
-- ============================================================================

create or replace function public.handle_new_donation_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_title text;
  v_owner_id uuid;
  v_status book_status;
begin
  select b.title, b.status, coalesce(b.donor_id, o.owner_id)
  into v_title, v_status, v_owner_id
  from public.books b
  left join public.organizations o on o.id = b.organization_id
  where b.id = new.book_id;

  if v_status = 'available' then
    update public.books set status = 'requested' where id = new.book_id;
  end if;

  if v_owner_id is not null then
    insert into public.notifications (profile_id, type, title, body, link)
    values (v_owner_id, 'request_received', 'New request for "' || coalesce(v_title, 'your book') || '"', new.message, '/dashboard/requests');
  end if;

  return new;
end;
$$;

drop trigger if exists on_donation_request_created on public.donation_requests;
create trigger on_donation_request_created
  after insert on public.donation_requests
  for each row execute function public.handle_new_donation_request();

-- ============================================================================
-- Accept
-- ============================================================================

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
  v_conversation_id uuid;
begin
  select dr.book_id, dr.requester_id, dr.quantity_requested, coalesce(b.donor_id, o.owner_id), b.quantity_available
  into v_book_id, v_requester_id, v_quantity, v_owner_id, v_remaining
  from public.donation_requests dr
  join public.books b on b.id = dr.book_id
  left join public.organizations o on o.id = b.organization_id
  where dr.id = p_request_id and dr.status = 'pending';

  if v_owner_id is null or (v_owner_id <> auth.uid() and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  update public.donation_requests set status = 'accepted', responded_at = now() where id = p_request_id;

  v_remaining := greatest(coalesce(v_remaining, 0) - v_quantity, 0);
  update public.books set quantity_available = v_remaining, status = case when v_remaining <= 0 then 'reserved' else status end
  where id = v_book_id;

  insert into public.conversations (donation_request_id) values (p_request_id) returning id into v_conversation_id;
  insert into public.conversation_participants (conversation_id, profile_id) values (v_conversation_id, v_requester_id), (v_conversation_id, v_owner_id);

  insert into public.notifications (profile_id, type, title, body, link)
  values (v_requester_id, 'request_accepted', 'Your request was accepted', 'Coordinate the handover in Messages.', '/messages');
end;
$$;

-- ============================================================================
-- Reject
-- ============================================================================

create or replace function public.reject_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_book_id uuid;
  v_requester_id uuid;
  v_owner_id uuid;
  v_pending_count int;
begin
  select dr.book_id, dr.requester_id, coalesce(b.donor_id, o.owner_id)
  into v_book_id, v_requester_id, v_owner_id
  from public.donation_requests dr
  join public.books b on b.id = dr.book_id
  left join public.organizations o on o.id = b.organization_id
  where dr.id = p_request_id and dr.status = 'pending';

  if v_owner_id is null or (v_owner_id <> auth.uid() and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  update public.donation_requests set status = 'rejected', responded_at = now() where id = p_request_id;

  select count(*) into v_pending_count from public.donation_requests where book_id = v_book_id and status = 'pending';
  if v_pending_count = 0 then
    update public.books set status = 'available' where id = v_book_id and status = 'requested';
  end if;

  insert into public.notifications (profile_id, type, title, body, link)
  values (v_requester_id, 'request_rejected', 'Your request was declined', null, '/dashboard/requests');
end;
$$;

-- ============================================================================
-- Complete (marks donation done, updates stats, awards achievements)
-- ============================================================================

create or replace function public.complete_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_book_id uuid;
  v_requester_id uuid;
  v_owner_id uuid;
  v_donor_profile_id uuid;
  v_quantity int;
begin
  select dr.book_id, dr.requester_id, dr.quantity_requested, coalesce(b.donor_id, o.owner_id), b.donor_id
  into v_book_id, v_requester_id, v_quantity, v_owner_id, v_donor_profile_id
  from public.donation_requests dr
  join public.books b on b.id = dr.book_id
  left join public.organizations o on o.id = b.organization_id
  where dr.id = p_request_id and dr.status = 'accepted';

  if v_owner_id is null or (v_owner_id <> auth.uid() and not public.is_admin()) then
    raise exception 'not authorized';
  end if;

  update public.donation_requests set status = 'completed', completed_at = now() where id = p_request_id;
  update public.books set status = 'completed' where id = v_book_id;

  if v_donor_profile_id is not null then
    update public.profiles
    set books_donated_count = books_donated_count + v_quantity,
        donations_completed_count = donations_completed_count + 1,
        people_supported_count = people_supported_count + 1
    where id = v_donor_profile_id;

    insert into public.user_achievements (profile_id, achievement_id)
    select v_donor_profile_id, a.id
    from public.achievements a
    join public.profiles p on p.id = v_donor_profile_id
    where (
      (a.threshold_type = 'books_donated' and p.books_donated_count >= a.threshold_value) or
      (a.threshold_type = 'donations_completed' and p.donations_completed_count >= a.threshold_value) or
      (a.threshold_type = 'people_supported' and p.people_supported_count >= a.threshold_value)
    )
    on conflict (profile_id, achievement_id) do nothing;
  end if;

  update public.profiles set books_received_count = books_received_count + v_quantity where id = v_requester_id;

  insert into public.notifications (profile_id, type, title, body, link)
  values (v_requester_id, 'donation_completed', 'Donation completed', 'Please rate your experience.', '/dashboard/requests');
end;
$$;

-- ============================================================================
-- Cancel: requester withdraws their own pending request
-- ============================================================================

create or replace function public.cancel_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_book_id uuid;
  v_pending_count int;
begin
  update public.donation_requests set status = 'cancelled'
  where id = p_request_id and requester_id = auth.uid() and status = 'pending'
  returning book_id into v_book_id;

  if v_book_id is not null then
    select count(*) into v_pending_count from public.donation_requests where book_id = v_book_id and status = 'pending';
    if v_pending_count = 0 then
      update public.books set status = 'available' where id = v_book_id and status = 'requested';
    end if;
  end if;
end;
$$;
