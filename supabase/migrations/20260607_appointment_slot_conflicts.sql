create or replace function public.parse_appointment_duration_minutes(duration_value text)
returns integer
language sql
immutable
as $$
  select coalesce(
    nullif(substring(coalesce(duration_value, '') from '([0-9]+(?:\.[0-9]+)?)'), '')::numeric,
    30
  )::integer
$$;

create or replace function public.get_booked_appointments_for_date(target_date date)
returns table (
  id uuid,
  appointment_time text,
  duration text,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    appointments.id,
    appointments.appointment_time,
    appointments.duration,
    appointments.status
  from public.appointments
  where appointments.appointment_date = target_date
    and appointments.status not in ('Cancelled', 'Rejected')
  order by appointments.appointment_time asc
$$;

create or replace function public.prevent_appointment_slot_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_start time;
  requested_duration integer;
begin
  if new.status in ('Cancelled', 'Rejected') then
    return new;
  end if;

  requested_start := new.appointment_time::time;
  requested_duration := public.parse_appointment_duration_minutes(new.duration);

  if exists (
    select 1
    from public.appointments existing_appointment
    where existing_appointment.appointment_date = new.appointment_date
      and existing_appointment.id <> coalesce(new.id, gen_random_uuid())
      and existing_appointment.status not in ('Cancelled', 'Rejected')
      and requested_start
        < (existing_appointment.appointment_time::time
          + (interval '1 minute' * public.parse_appointment_duration_minutes(existing_appointment.duration)))
      and existing_appointment.appointment_time::time
        < (requested_start + (interval '1 minute' * requested_duration))
  ) then
    raise exception 'This appointment slot is no longer available. Please choose another time.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_prevent_slot_conflicts on public.appointments;

create trigger appointments_prevent_slot_conflicts
before insert or update on public.appointments
for each row
execute function public.prevent_appointment_slot_conflicts();
