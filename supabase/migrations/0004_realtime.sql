-- Enable Supabase Realtime on messages so the chat thread updates live.
-- Run in the Supabase SQL Editor after the previous migrations.

alter publication supabase_realtime add table public.messages;
