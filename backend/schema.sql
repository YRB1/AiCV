-- Run this in your Supabase SQL Editor (in addition to tool/app/supabase-schema.sql)
-- Adds tables and columns needed by the backend

-- Student verifications table
create table if not exists student_verifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade unique not null,
  student_email text not null,
  token        text not null,
  expires_at   timestamptz not null,
  verified     boolean default false,
  created_at   timestamptz default now()
);

alter table student_verifications enable row level security;
-- Only service role can access this table (no user-facing RLS needed)

-- Add student + free tiers to profiles (if using the existing tool/app schema)
alter table profiles
  add column if not exists student_email    text,
  add column if not exists student_verified boolean default false,
  add column if not exists is_student       boolean default false;

-- Update the subscription_tier check constraint to include 'free' and 'student'
-- (Run only if the constraint exists and needs updating)
-- alter table profiles drop constraint if exists profiles_subscription_tier_check;
-- alter table profiles add constraint profiles_subscription_tier_check
--   check (subscription_tier in ('free', 'basic', 'pro', 'student', 'unlimited'));
