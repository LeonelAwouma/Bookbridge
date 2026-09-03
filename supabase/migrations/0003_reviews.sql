-- BookBridge reviews: keep profiles.rating_avg / rating_count in sync via trigger
-- (the reviewer isn't allowed to write another profile's row directly under RLS).
-- Run in the Supabase SQL Editor AFTER 0001_init.sql and 0002_donation_workflow.sql.

create or replace function public.handle_new_review()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_avg numeric(3,2);
  v_count int;
begin
  select round(avg(rating)::numeric, 2), count(*) into v_avg, v_count
  from public.reviews
  where reviewee_id = new.reviewee_id;

  update public.profiles set rating_avg = coalesce(v_avg, 0), rating_count = v_count where id = new.reviewee_id;

  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute function public.handle_new_review();
