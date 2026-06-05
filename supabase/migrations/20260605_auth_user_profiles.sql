create policy "Authenticated users can read doctor profiles"
  on public.doctor_profiles
  for select
  using (auth.role() = 'authenticated');

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text := coalesce(new.raw_user_meta_data ->> 'role', 'patient');
begin
  if user_role = 'doctor' then
    insert into public.doctor_profiles (
      id,
      full_name,
      role_title,
      qualification,
      experience,
      about,
      photo_url
    )
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), 'Doctor'),
      coalesce(nullif(new.raw_user_meta_data ->> 'role_title', ''), 'General Practitioner'),
      coalesce(nullif(new.raw_user_meta_data ->> 'qualification', ''), 'Qualification not set'),
      coalesce(nullif(new.raw_user_meta_data ->> 'experience', ''), 'Experience not set'),
      coalesce(
        nullif(new.raw_user_meta_data ->> 'about', ''),
        'Doctor profile information will be updated soon.'
      ),
      coalesce(new.raw_user_meta_data ->> 'photo_url', '')
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      role_title = excluded.role_title,
      qualification = excluded.qualification,
      experience = excluded.experience,
      about = excluded.about,
      photo_url = excluded.photo_url,
      updated_at = now();

    return new;
  end if;

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
    'patient'
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
for each row execute function public.handle_auth_user_profile();
