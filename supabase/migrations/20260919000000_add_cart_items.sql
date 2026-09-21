drop table if exists public.cart_items cascade;

create table public.cart_items (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    user_email text,
    product_id text not null,
    product_name text not null,
    product_image text,
    quantity integer not null default 1 check (quantity > 0),
    unit_price numeric not null,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    constraint cart_items_pkey primary key (id)
);

alter table public.cart_items enable row level security;

-- A user can only ever have one row per product in their cart.
-- This backs the client-side upsert: ON CONFLICT (user_id, product_id).
create unique index cart_items_user_product_key on public.cart_items (user_id, product_id);
alter table public.cart_items add constraint cart_items_user_product_unique unique using index cart_items_user_product_key;

-- Grants
grant select, insert, update, delete on table public.cart_items to authenticated;
grant select, insert, update, delete on table public.cart_items to service_role;

-- RLS Policies
create policy "Users can view their own cart items"
on public.cart_items
as permissive
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add items to their own cart"
on public.cart_items
as permissive
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
on public.cart_items
as permissive
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own cart items"
on public.cart_items
as permissive
for delete
to authenticated
using (auth.uid() = user_id);