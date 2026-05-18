-- Run this in Supabase SQL Editor

-- Profiles table
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  vorname text,
  nachname text,
  schule text,
  jahrgang text,
  wunschberuf text,
  wohnort text,
  telefon text,
  email text,
  demo_script text,
  subscription_tier text default 'basic' check (subscription_tier in ('basic','pro','unlimited')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'active',
  updated_at timestamptz default now()
);

-- ALTER for existing tables (run if table already exists):
-- alter table profiles add column if not exists subscription_tier text default 'basic' check (subscription_tier in ('basic','pro','unlimited'));
-- alter table profiles add column if not exists stripe_customer_id text;
-- alter table profiles add column if not exists stripe_subscription_id text;
-- alter table profiles add column if not exists subscription_status text default 'active';

-- Leads / Bewerbungen
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  firma text not null,
  beruf text not null,
  stadt text,
  kanton text,
  telefon text,
  email text,
  website text,
  url text,
  status text default 'neu' check (status in ('neu','kontaktiert','antwort','absage','zusage')),
  generated_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, firma, beruf)
);

-- 24h Search Cache
create table if not exists search_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  beruf text,
  kanton text,
  results jsonb,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table leads enable row level security;

create policy "Users can manage own profile"
  on profiles for all using (auth.uid() = user_id);

create policy "Users can manage own leads"
  on leads for all using (auth.uid() = user_id);

-- search_cache is server-side only (service role), no RLS needed