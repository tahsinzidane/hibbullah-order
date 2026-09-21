
  create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "brand" text not null,
    "generic_name" text not null,
    "category_id" text not null,
    "manufacturer_id" text not null,
    "unit" text not null,
    "description" text not null,
    "price" numeric not null,
    "original_price" numeric,
    "discount_percent" numeric,
    "stock" integer not null,
    "image" text,
    "primary_image" text,
    "secondary_image" text,
    "batch_number" text,
    "expiry_date" text,
    "is_active" boolean default true,
    "is_featured" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."products" enable row level security;

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";


  create policy "Allow authenticated insert"
  on "public"."products"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow public insert"
  on "public"."products"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read"
  on "public"."products"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public select"
  on "public"."products"
  as permissive
  for select
  to public
using (true);


drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


