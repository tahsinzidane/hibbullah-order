create table if not exists public.addresses (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    user_email text,
    label text not null,
    phone text not null,
    comment text,
    division text not null,
    district text not null,
    upazila text not null,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    constraint addresses_pkey primary key (id)
);

alter table public.addresses enable row level security;

-- Grants
grant select, insert, update, delete on table public.addresses to authenticated;
grant select, insert, update, delete on table public.addresses to service_role;

-- RLS Policies (idempotent so the migration can be re-applied after being
-- created outside the CLI's migration history)
drop policy if exists "Users can view their own addresses" on public.addresses;
create policy "Users can view their own addresses"
on public.addresses
as permissive
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can add their own addresses" on public.addresses;
create policy "Users can add their own addresses"
on public.addresses
as permissive
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own addresses" on public.addresses;
create policy "Users can update their own addresses"
on public.addresses
as permissive
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own addresses" on public.addresses;
create policy "Users can delete their own addresses"
on public.addresses
as permissive
for delete
to authenticated
using (auth.uid() = user_id);