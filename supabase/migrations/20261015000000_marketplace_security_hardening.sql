-- Consolidate marketplace writes behind validated database operations and add
-- transaction-safe limits to public marketplace activity.

create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create table if not exists app_private.marketplace_rate_events (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null check (action in ('request_publish', 'offer_submit')),
  occurred_at timestamptz not null default now()
);
create index if not exists marketplace_rate_events_actor_action_time_idx
  on app_private.marketplace_rate_events (actor_id, action, occurred_at desc);
alter table app_private.marketplace_rate_events enable row level security;
revoke all on app_private.marketplace_rate_events from public, anon, authenticated;

create or replace function app_private.enforce_marketplace_rate_limit(
  p_action text,
  p_actor_id uuid,
  p_max_events integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_count integer;
begin
  if p_actor_id is null or p_actor_id <> (select auth.uid()) then
    raise exception using errcode = '42501', message = 'Acción no autorizada.';
  end if;
  if p_action not in ('request_publish', 'offer_submit') or p_max_events < 1 or p_window <= interval '0 seconds' then
    raise exception using errcode = '22023', message = 'Límite de actividad inválido.';
  end if;

  -- Serialize concurrent events for one actor/action so parallel requests
  -- cannot bypass the limit by checking the count at the same time.
  perform pg_advisory_xact_lock(hashtextextended(p_action || ':' || p_actor_id::text, 0));
  delete from app_private.marketplace_rate_events
    where actor_id = p_actor_id and action = p_action and occurred_at < now() - interval '24 hours';
  select count(*)::integer into event_count
    from app_private.marketplace_rate_events
    where actor_id = p_actor_id and action = p_action and occurred_at >= now() - p_window;
  if event_count >= p_max_events then
    raise exception using errcode = 'P0001', message = 'Alcanzaste el límite temporal. Inténtalo más tarde.';
  end if;
  insert into app_private.marketplace_rate_events (actor_id, action) values (p_actor_id, p_action);
end;
$$;
revoke all on function app_private.enforce_marketplace_rate_limit(text, uuid, integer, interval) from public, anon, authenticated;

create or replace function app_private.guard_marketplace_offer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.technician_id <> (select auth.uid())
    or not exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'technician' and p.is_available
    )
    or not exists (
      select 1 from public.service_requests r
      where r.id = new.request_id and r.status = 'published'
    ) then
    raise exception using errcode = '42501', message = 'No puedes enviar una propuesta para esta solicitud.';
  end if;
  if new.price_cop > 10000000000 or length(new.message) > 500 then
    raise exception using errcode = '22023', message = 'El precio o mensaje supera el límite permitido.';
  end if;
  perform app_private.enforce_marketplace_rate_limit('offer_submit', new.technician_id, 15, interval '1 hour');
  return new;
end;
$$;
revoke all on function app_private.guard_marketplace_offer() from public, anon, authenticated;

drop trigger if exists guard_marketplace_offer on public.offers;
create trigger guard_marketplace_offer
  before insert on public.offers
  for each row execute function app_private.guard_marketplace_offer();

drop policy if exists "Technicians can submit one offer per request" on public.offers;
create policy "Available technicians can submit one offer per request"
  on public.offers for insert to authenticated
  with check (
    technician_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'technician' and p.is_available
    )
    and exists (select 1 from public.service_requests r where r.id = request_id and r.status = 'published')
  );

-- The browser must use publish_marketplace_request, which validates and writes
-- the public, private-address and media rows atomically.
revoke insert on public.service_requests from public, anon, authenticated;
revoke insert on public.request_private_details from public, anon, authenticated;
revoke insert on public.request_media from public, anon, authenticated;

create or replace function public.publish_marketplace_request(
  p_request_id uuid,
  p_category text,
  p_title text,
  p_description text,
  p_sector text,
  p_budget_cop bigint,
  p_payment_method text,
  p_desired_date text,
  p_exact_address text,
  p_photo_paths text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'client') then
    raise exception using errcode = '42501', message = 'Solo una cuenta de cliente puede publicar solicitudes.';
  end if;
  if p_request_id is null
    or nullif(trim(p_category), '') is null or length(p_category) > 80
    or nullif(trim(p_title), '') is null or length(p_title) > 120
    or nullif(trim(p_description), '') is null or length(p_description) > 3000
    or nullif(trim(p_sector), '') is null or length(p_sector) > 80
    or nullif(trim(p_exact_address), '') is null or length(p_exact_address) > 300
    or p_budget_cop is null or p_budget_cop < 1000 or p_budget_cop > 10000000000
    or p_payment_method is null or p_payment_method not in ('cash', 'digital')
    or nullif(trim(p_desired_date), '') is null or length(p_desired_date) > 120
    or coalesce(array_length(p_photo_paths, 1), 0) > 3
    or exists (select 1 from unnest(coalesce(p_photo_paths, '{}')) as paths(path) where path is null or length(path) > 500)
  then
    raise exception using errcode = '22023', message = 'Revisa la información de la solicitud.';
  end if;
  if exists (
    select 1 from unnest(coalesce(p_photo_paths, '{}')) as paths(path)
    where path not like (select auth.uid())::text || '/' || p_request_id::text || '/%'
  ) then
    raise exception using errcode = '42501', message = 'Ruta de foto no autorizada.';
  end if;

  perform app_private.enforce_marketplace_rate_limit('request_publish', (select auth.uid()), 5, interval '1 hour');
  insert into public.service_requests (
    id, client_id, category, title, description, sector, budget_cop, payment_method, desired_date
  ) values (
    p_request_id, (select auth.uid()), trim(p_category), trim(p_title), trim(p_description),
    trim(p_sector), p_budget_cop, p_payment_method, trim(p_desired_date)
  );
  insert into public.request_private_details (request_id, exact_address)
    values (p_request_id, trim(p_exact_address));
  insert into public.request_media (request_id, photo_paths)
    values (p_request_id, coalesce(p_photo_paths, '{}'));
  return p_request_id;
end;
$$;
revoke all on function public.publish_marketplace_request(uuid, text, text, text, text, bigint, text, text, text, text[]) from public, anon;
grant execute on function public.publish_marketplace_request(uuid, text, text, text, text, bigint, text, text, text, text[]) to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Authenticated clients upload request photos to their own folder" on storage.objects;
create policy "Authenticated clients upload request photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'client')
  );

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'request-photos';
