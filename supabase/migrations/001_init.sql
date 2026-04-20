-- Run this in your Supabase SQL editor

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text not null,
  points integer default 0,
  level integer default 1,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
