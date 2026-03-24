-- Run this entire SQL in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/pcrboszzhvzvhyhinvxq/sql

-- ── Profiles table ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  email       text,
  role        text default 'editor' check (role in ('admin', 'editor')),
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ── Drafts table ─────────────────────────────────────────────────────────────
create table if not exists public.drafts (
  id                     uuid default gen_random_uuid() primary key,
  content_id             text,
  user_id                uuid references auth.users(id) on delete set null,
  title                  text not null,
  primary_keyword        text,
  intent                 text,
  angle                  text,
  finsery_pro_tip        text default 'no',
  content_specification  text,
  key_takeaway           text default 'no',
  story_hook             text default 'no',
  accordion              text default 'no',
  reference_links        text,
  avoid                  text,
  brand_mention          text default 'Finsery',
  tone                   text,
  target_audience        text default 'US Consumers',
  word_count             integer,
  category               text,
  tags                   text[] default '{}',
  content                text,
  edited_content         text,
  wp_pushed              boolean default false,
  wp_draft_link          text default '',
  wp_post_id             integer,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table public.drafts enable row level security;

create policy "All authenticated users can view drafts" on public.drafts
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert drafts" on public.drafts
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update drafts" on public.drafts
  for update using (auth.role() = 'authenticated');

-- ── Auto-create profile on signup ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'editor')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Make first user admin ─────────────────────────────────────────────────────
-- After you sign up, run this to make yourself admin:
-- update public.profiles set role = 'admin' where email = 'your@email.com';
