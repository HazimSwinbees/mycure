create table if not exists public.clinic_info (
  id integer primary key default 1 check (id = 1),
  clinic_name text not null default 'MyCure Central Clinic',
  tagline text not null default 'Modern primary care with clear digital access.',
  email text not null default 'hello@mycure.com',
  phone text not null default '+60 12 345 6789',
  address_line_1 text not null default 'Lot 12, Jalan Clinic Sentral',
  address_line_2 text not null default 'Kuching, Sarawak 93350',
  operating_hours text not null default 'Monday - Friday, 9:00 AM - 5:00 PM',
  website text not null default 'https://mycure.example',
  description text not null default 'MyCure supports daily consultations, follow-up care, preventive screening, and coordinated clinic operations from one connected platform.',
  emergency_note text not null default 'For urgent emergencies, call local emergency services or go to the nearest hospital.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clinic_info enable row level security;

create policy "Authenticated users can read clinic info"
  on public.clinic_info
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clinic info"
  on public.clinic_info
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clinic info"
  on public.clinic_info
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.clinic_info (
  id,
  clinic_name,
  tagline,
  email,
  phone,
  address_line_1,
  address_line_2,
  operating_hours,
  website,
  description,
  emergency_note
)
values (
  1,
  'MyCure Central Clinic',
  'Modern primary care with clear digital access.',
  'hello@mycure.com',
  '+60 12 345 6789',
  'Lot 12, Jalan Clinic Sentral',
  'Kuching, Sarawak 93350',
  'Monday - Friday, 9:00 AM - 5:00 PM',
  'https://mycure.example',
  'MyCure supports daily consultations, follow-up care, preventive screening, and coordinated clinic operations from one connected platform.',
  'For urgent emergencies, call local emergency services or go to the nearest hospital.'
)
on conflict (id) do update set
  clinic_name = excluded.clinic_name,
  tagline = excluded.tagline,
  email = excluded.email,
  phone = excluded.phone,
  address_line_1 = excluded.address_line_1,
  address_line_2 = excluded.address_line_2,
  operating_hours = excluded.operating_hours,
  website = excluded.website,
  description = excluded.description,
  emergency_note = excluded.emergency_note,
  updated_at = now();
