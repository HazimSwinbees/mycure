create table if not exists public.doctor_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Dr. Sarah Lee',
  role_title text not null default 'General Practitioner',
  qualification text not null default 'MBBS, University of Malaya',
  experience text not null default '8 Years',
  languages text[] not null default array['English', 'Malay', 'Mandarin'],
  specializations text[] not null default array['General Medicine', 'Family Health', 'Preventive Care'],
  working_hours text[] not null default array['Mon - Fri: 9 AM - 5 PM', 'Sat: 9 AM - 12 PM'],
  about text not null default 'Dr. Sarah Lee has extensive experience in primary healthcare and preventive medicine.',
  photo_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.doctor_profiles enable row level security;

create policy "Doctors can read own profile"
  on public.doctor_profiles
  for select
  using (auth.uid() = id);

create policy "Doctors can insert own profile"
  on public.doctor_profiles
  for insert
  with check (auth.uid() = id);

create policy "Doctors can update own profile"
  on public.doctor_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
