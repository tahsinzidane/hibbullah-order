-- Orders and order items tables backing the customer order flow.
-- NOTE: delivery_cycle_id is intentionally a plain nullable column (no FK)
-- because the delivery_cycles table does not exist yet.

create table if not exists public.orders (
    id uuid not null default gen_random_uuid(),
    order_number text not null,
    customer_id uuid not null references auth.users (id) on delete cascade,
    delivery_cycle_id uuid,
    status text not null default 'PENDING',
    subtotal numeric not null default 0,
    discount numeric not null default 0,
    delivery_fee numeric not null default 0,
    total numeric not null default 0,
    payment_method text not null default 'CASH_ON_DELIVERY',
    address_id uuid references public.addresses (id) on delete set null,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    constraint orders_pkey primary key (id)
);

create table if not exists public.order_items (
    id uuid not null default gen_random_uuid(),
    order_id uuid not null references public.orders (id) on delete cascade,
    product_id uuid not null references public.products (id),
    quantity integer not null default 1 check (quantity > 0),
    unit_price numeric not null,
    discount_percent numeric not null default 0,
    total numeric not null,
    constraint order_items_pkey primary key (id)
);

create index if not exists orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Grants
grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.orders to service_role;
grant select, insert, update, delete on table public.order_items to authenticated;
grant select, insert, update, delete on table public.order_items to service_role;

-- RLS Policies: orders
create policy "Customers can view their own orders"
on public.orders
as permissive
for select
to authenticated
using (auth.uid() = customer_id);

create policy "Customers can place their own orders"
on public.orders
as permissive
for insert
to authenticated
with check (auth.uid() = customer_id);

create policy "Customers can delete their own orders"
on public.orders
as permissive
for delete
to authenticated
using (auth.uid() = customer_id);

create policy "Admins can manage orders"
on public.orders
as permissive
for all
to authenticated
using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'))
with check (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

-- RLS Policies: order_items (follow the parent order / admins)
create policy "Users can view items of their own orders"
on public.order_items
as permissive
for select
to authenticated
using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.customer_id = auth.uid()
));

create policy "Users can add items to their own orders"
on public.order_items
as permissive
for insert
to authenticated
with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.customer_id = auth.uid()
));

create policy "Admins can manage order items"
on public.order_items
as permissive
for all
to authenticated
using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'))
with check (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));