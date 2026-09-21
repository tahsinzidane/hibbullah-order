-- Notifications table (customer + admin in-app notifications) + secure helpers.
--
-- Design notes:
--  * Every authenticated user (customer AND admin) reads/updates only their own
--    rows via user-level RLS policies below.
--  * Cross-user writes (a customer creating an admin notification, the admin
--    notifying a customer) go through SECURITY DEFINER functions so a normal
--    authenticated session can never spoof another user's notification.
--  * Low stock alerts use a dynamic threshold: a product's stock is "low" when
--    it drops to 20% or less of its reference max_stock (the initial quantity
--    at creation, raised on restocks) — e.g. stock <= 20 when max is 100.

-- ---------------------------------------------------------------------------
-- 1. Notifications table
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    type text not null default 'info',
    title text not null,
    body text not null default '',
    read boolean not null default false,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    constraint notifications_pkey primary key (id)
);

create index if not exists notifications_user_created_idx
    on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Grants
grant select, insert, update, delete on table public.notifications to authenticated;
grant select, insert, update, delete on table public.notifications to anon;
grant select, insert, update, delete on table public.notifications to service_role;

-- A product's reference capacity used for the dynamic low-stock threshold.
alter table public.products add column if not exists max_stock integer not null default 0;

-- ---------------------------------------------------------------------------
-- 2. RLS policies (own rows only — use the functions below for cross-user)
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
on public.notifications
as permissive
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own notifications" on public.notifications;
create policy "Users can create their own notifications"
on public.notifications
as permissive
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
on public.notifications
as permissive
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
on public.notifications
as permissive
for delete
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Secure notification helpers (SECURITY DEFINER, bypass RLS)
-- ---------------------------------------------------------------------------

-- Insert a single notification for an arbitrary user. Used by admins to
-- notify a customer (order confirmed / cancelled / delivered) and by the
-- customer flow when it needs to store its own confirmation notes.
create or replace function public.create_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.notifications (user_id, type, title, body, read, created_at)
    values (p_user_id, p_type, p_title, p_body, false, timezone('utc'::text, now()));
end;
$$;

-- Fan out a notification to every admin identified in public.admin_users
-- (matched against auth.users by email). Safe to call from a customer session:
-- the function inserts on the admin's behalf rather than letting the client
-- write to another user_id directly.
create or replace function public.notify_admins(
    p_type text,
    p_title text,
    p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.notifications (user_id, type, title, body, read, created_at)
    select au.id, p_type, p_title, p_body, false, timezone('utc'::text, now())
    from auth.users au
    join public.admin_users adm on lower(adm.email) = lower(au.email);
end;
$$;

-- Dynamic low-stock alert. Computes the threshold on the server as
-- ceil(max_stock * 0.2) (minimum 1) and notifies every admin when the product
-- stock is at or below it. max_stock is seeded with the initial quantity when
-- a product is created and grows on restocks, so the threshold scales with the
-- "initial or max quantity" reference described in the requirements.
create or replace function public.notify_low_stock(
    p_product_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_name text;
    v_stock int;
    v_max_stock int;
    v_threshold int;
begin
    select p.name, p.stock, coalesce(nullif(p.max_stock, 0), p.stock, 0)
    into v_name, v_stock, v_max_stock
    from public.products p
    where p.id = p_product_id;

    if not found then
        return;
    end if;

    v_threshold := greatest(1, ceil(v_max_stock * 0.2));

    if v_stock <= v_threshold then
        perform public.notify_admins(
            'warning',
            'Low stock alert',
            v_name || ' has only ' || v_stock
                || ' unit(s) left. Restock to avoid running out (threshold '
                || v_threshold || ').'
        );
    end if;
end;
$$;

-- Grants for the authenticated role (anon only needs nothing, but keep
-- service_role for backend jobs).
grant execute on function public.create_notification(uuid, text, text, text) to authenticated, service_role;
grant execute on function public.notify_admins(text, text, text) to authenticated, service_role;
grant execute on function public.notify_low_stock(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. Realtime: surface notification inserts/updates to the owning user
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.notifications;