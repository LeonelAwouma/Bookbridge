-- Keep campaigns.collected_quantity in sync with campaign_donations
-- (a regular donor isn't allowed to update someone else's campaign row directly).
-- Run in the Supabase SQL Editor after the previous migrations.

create or replace function public.handle_new_campaign_donation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.campaigns
  set collected_quantity = collected_quantity + new.quantity,
      status = case when collected_quantity + new.quantity >= goal_quantity then 'completed' else status end
  where id = new.campaign_id;

  return new;
end;
$$;

drop trigger if exists on_campaign_donation_created on public.campaign_donations;
create trigger on_campaign_donation_created
  after insert on public.campaign_donations
  for each row execute function public.handle_new_campaign_donation();
