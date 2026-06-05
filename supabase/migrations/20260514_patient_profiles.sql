create table if not exists public.patient_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  ic_passport_number text not null,
  date_of_birth date not null,
  gender text not null,
  phone text not null,
  email text not null,
  home_address text not null,
  photo_path text,
  photo_url text,
  role text not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patient_profiles enable row level security;

create policy "Patients can read own profile"
  on public.patient_profiles
  for select
  using (auth.uid() = id);

create policy "Patients can insert own profile"
  on public.patient_profiles
  for insert
  with check (auth.uid() = id);

create policy "Patients can update own profile"
  on public.patient_profiles
  for update
  using (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', true)
on conflict (id) do nothing;

create policy "Public can read patient photos"
  on storage.objects
  for select
  using (bucket_id = 'patient-photos');

create policy "Authenticated users can upload patient photos"
  on storage.objects
  for insert
  with check (bucket_id = 'patient-photos' and auth.uid()::text = split_part(name, '/', 1));

create policy "Authenticated users can update own patient photos"
  on storage.objects
  for update
  using (bucket_id = 'patient-photos' and auth.uid()::text = split_part(name, '/', 1));

create policy "Authenticated users can delete own patient photos"
  on storage.objects
  for delete
  using (bucket_id = 'patient-photos' and auth.uid()::text = split_part(name, '/', 1));

create or replace function public.handle_new_patient_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.patient_profiles (
    id,
    first_name,
    last_name,
    full_name,
    ic_passport_number,
    date_of_birth,
    gender,
    phone,
    email,
    home_address,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'ic_passport_number', ''),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    coalesce(new.raw_user_meta_data ->> 'gender', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'home_address', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'patient')
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    full_name = excluded.full_name,
    ic_passport_number = excluded.ic_passport_number,
    date_of_birth = excluded.date_of_birth,
    gender = excluded.gender,
    phone = excluded.phone,
    email = excluded.email,
    home_address = excluded.home_address,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_patient_profile();
