-- Allow admins (via admin_users email match) to read all profiles and
-- addresses so the admin order/customer screens can resolve customer names,
-- phone numbers and delivery details for every user.

create policy "Admins can view all profiles"
on public.profiles
as permissive
for select
to authenticated
using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));

create policy "Admins can view all addresses"
on public.addresses
as permissive
for select
to authenticated
using (exists (select 1 from public.admin_users where email = auth.jwt() ->> 'email'));