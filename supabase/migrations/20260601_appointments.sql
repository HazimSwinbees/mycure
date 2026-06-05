create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  service_id text references public.services (id) on delete set null,
  service_name text not null,
  service_category text not null default 'General',
  doctor_name text not null default 'Care team',
  appointment_date date not null,
  appointment_time text not null,
  duration text not null default 'Not specified',
  location text not null default 'Main clinic',
  reason text not null default '',
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "Patients can read own appointments"
  on public.appointments
  for select
  using (auth.uid() = patient_id);

create policy "Patients can insert own appointments"
  on public.appointments
  for insert
  with check (auth.uid() = patient_id);

create policy "Patients can update own appointments"
  on public.appointments
  for update
  using (auth.uid() = patient_id);
