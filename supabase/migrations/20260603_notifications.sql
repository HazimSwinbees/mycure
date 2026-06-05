create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'General',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Patients can read own notifications"
  on public.notifications
  for select
  using (auth.uid() = patient_id);

create policy "Patients can insert own notifications"
  on public.notifications
  for insert
  with check (auth.uid() = patient_id);

create policy "Patients can update own notifications"
  on public.notifications
  for update
  using (auth.uid() = patient_id);
