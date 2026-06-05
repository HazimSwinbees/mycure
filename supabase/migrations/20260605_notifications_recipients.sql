alter table public.notifications
  alter column patient_id drop not null;

alter table public.notifications
  add column if not exists recipient_type text not null default 'patient',
  add column if not exists appointment_id text null,
  add column if not exists medical_record_id text null;

create index if not exists notifications_recipient_type_created_at_idx
  on public.notifications (recipient_type, created_at desc);

create policy "Authenticated users can insert notifications"
  on public.notifications
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can read doctor notifications"
  on public.notifications
  for select
  using (
    auth.role() = 'authenticated'
    and recipient_type = 'doctor'
  );

create policy "Authenticated users can update doctor notifications"
  on public.notifications
  for update
  using (
    auth.role() = 'authenticated'
    and recipient_type = 'doctor'
  )
  with check (
    auth.role() = 'authenticated'
    and recipient_type = 'doctor'
  );
