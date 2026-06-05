create table if not exists public.services (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  overview text not null default '',
  doctor text not null default 'Care team',
  duration text not null default 'Not specified',
  slot text not null default 'Contact clinic',
  price text not null default 'Contact clinic',
  rating numeric(2, 1),
  reviews integer,
  available boolean not null default true,
  location text not null default 'Main clinic',
  preparation text not null default 'No special preparation required.',
  includes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Authenticated users can read services"
  on public.services
  for select
  using (auth.role() = 'authenticated');

insert into public.services (
  id,
  name,
  category,
  description,
  overview,
  doctor,
  duration,
  slot,
  price,
  rating,
  reviews,
  available,
  location,
  preparation,
  includes
)
values
  (
    'general-consultation',
    'General Consultation',
    'Primary Care',
    'Symptoms, medication advice, referrals, and follow-up care.',
    'General consultation covers common symptoms, treatment planning, medication review, and referrals when further care is required.',
    'Dr. Sarah Lee',
    '30 min',
    'Today',
    'RM45',
    4.8,
    156,
    true,
    'MyCure Central, Room 203',
    'Bring current medication details and recent medical notes if available.',
    '["Symptom review", "Medication guidance", "Referral advice", "Follow-up planning"]'::jsonb
  ),
  (
    'health-screening',
    'Health Screening',
    'Wellness',
    'Preventive checks for blood pressure, glucose, cholesterol, and wellness.',
    'Health screening focuses on preventive monitoring to identify risks early and maintain long-term wellness.',
    'Nurse Care Team',
    '45 min',
    'This week',
    'RM90',
    4.9,
    203,
    true,
    'MyCure Central, Screening Unit',
    'Fast for 8 hours if your screening includes blood glucose or cholesterol tests.',
    '["Blood pressure check", "Glucose review", "Cholesterol screening", "Wellness summary"]'::jsonb
  ),
  (
    'dental-care',
    'Dental Care',
    'Dental',
    'Routine dental review, cleaning, and oral health consultation.',
    'Dental care appointments include oral assessment, professional cleaning, and practical guidance for daily care.',
    'Dr. Ryan Koh',
    '40 min',
    'Tomorrow',
    'RM75',
    4.7,
    98,
    true,
    'MyCure Dental Suite',
    'Share any sensitivity, gum discomfort, or recent dental treatment before the visit.',
    '["Dental review", "Cleaning session", "Oral health guidance", "Follow-up recommendation"]'::jsonb
  ),
  (
    'physiotherapy',
    'Physiotherapy',
    'Recovery',
    'Mobility assessment and guided recovery support.',
    'Physiotherapy appointments assess mobility, discomfort, and recovery goals with guided treatment planning.',
    'Rehab Team',
    '60 min',
    'Next week',
    'RM120',
    4.6,
    87,
    false,
    'MyCure Rehab Centre',
    'Wear comfortable clothing and bring any imaging or referral letters related to the condition.',
    '["Mobility assessment", "Recovery planning", "Exercise guidance", "Progress review"]'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  overview = excluded.overview,
  doctor = excluded.doctor,
  duration = excluded.duration,
  slot = excluded.slot,
  price = excluded.price,
  rating = excluded.rating,
  reviews = excluded.reviews,
  available = excluded.available,
  location = excluded.location,
  preparation = excluded.preparation,
  includes = excluded.includes,
  updated_at = now();
