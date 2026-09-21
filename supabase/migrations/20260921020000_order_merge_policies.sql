-- Customers need UPDATE access on orders + order_items so checkout can merge
-- new cart items into their existing PENDING order (quantity increments, total
-- recomputation) and refresh the selected delivery address. Without these the
-- RLS-backed client (anon/authenticated key) would silently no-op on update.
-- These policies mirror the existing customer INSERT policies.

-- orders: let owners refresh address_id and the recomputed money columns.
drop policy if exists "Customers can update their own orders" on public.orders;
create policy "Customers can update their own orders"
on public.orders
as permissive
for update
to authenticated
using (auth.uid() = customer_id)
with check (auth.uid() = customer_id);

-- order_items: let owners increment quantities on items belonging to their orders.
drop policy if exists "Users can update items of their own orders" on public.order_items;
create policy "Users can update items of their own orders"
on public.order_items
as permissive
for update
to authenticated
using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.customer_id = auth.uid()
))
with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.customer_id = auth.uid()
));