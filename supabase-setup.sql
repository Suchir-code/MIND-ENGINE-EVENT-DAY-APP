create table if not exists public.mind_engine_records (
  day integer not null check (day between 1 and 4),
  company text not null,
  student_number text default '',
  resume_collected boolean default false,
  feedback text default '',
  chat_time_1 text default '',
  pic_1 text default '',
  chat_time_2 text default '',
  pic_2 text default '',
  updated_at timestamptz default now(),
  primary key (day, company)
);

alter table public.mind_engine_records enable row level security;

create policy "Expo team can read records"
on public.mind_engine_records for select
to anon, authenticated
using (true);

create policy "Expo team can add records"
on public.mind_engine_records for insert
to anon, authenticated
with check (true);

create policy "Expo team can update records"
on public.mind_engine_records for update
to anon, authenticated
using (true)
with check (true);
