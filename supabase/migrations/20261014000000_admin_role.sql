alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('client', 'technician', 'admin'));

create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create or replace function app_private.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;
revoke all on function app_private.is_marketplace_admin() from public, anon;
grant execute on function app_private.is_marketplace_admin() to authenticated;

drop policy if exists "Profiles visible to their owner and technicians" on public.profiles;
create policy "Profiles visible to owners, technicians and admins"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or role = 'technician' or (select app_private.is_marketplace_admin()));

drop policy if exists "Clients and nearby technicians can read requests" on public.service_requests;
create policy "Clients, technicians and admins can read requests"
  on public.service_requests for select to authenticated
  using (
    (select app_private.is_marketplace_admin())
    or client_id = (select auth.uid())
    or (
      status = 'published'
      and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'technician')
    )
    or exists (
      select 1 from public.services s
      where s.request_id = service_requests.id
        and (s.client_id = (select auth.uid()) or s.technician_id = (select auth.uid()))
    )
  );

drop policy if exists "Request participants can read request media" on public.request_media;
create policy "Request participants and admins can read request media"
  on public.request_media for select to authenticated
  using (
    (select app_private.is_marketplace_admin())
    or exists (
      select 1 from public.service_requests r
      where r.id = request_media.request_id and r.client_id = (select auth.uid())
    )
    or exists (
      select 1 from public.profiles p
      join public.service_requests r on r.status = 'published'
      where p.id = (select auth.uid()) and p.role = 'technician' and r.id = request_media.request_id
    )
    or exists (
      select 1 from public.services s
      where s.request_id = request_media.request_id
        and (s.client_id = (select auth.uid()) or s.technician_id = (select auth.uid()))
    )
  );

drop policy if exists "Users can read related offers" on public.offers;
create policy "Users and admins can read related offers"
  on public.offers for select to authenticated
  using (
    (select app_private.is_marketplace_admin())
    or technician_id = (select auth.uid())
    or exists (
      select 1 from public.service_requests r
      where r.id = offers.request_id and r.client_id = (select auth.uid())
    )
  );

drop policy if exists "Service participants can read their services" on public.services;
create policy "Service participants and admins can read services"
  on public.services for select to authenticated
  using (
    (select app_private.is_marketplace_admin())
    or client_id = (select auth.uid())
    or technician_id = (select auth.uid())
  );

drop policy if exists "Technicians can read their wallet" on public.technician_wallets;
create policy "Technicians and admins can read wallets"
  on public.technician_wallets for select to authenticated
  using (technician_id = (select auth.uid()) or (select app_private.is_marketplace_admin()));

drop policy if exists "Technicians can read their wallet transactions" on public.wallet_transactions;
create policy "Technicians and admins can read wallet transactions"
  on public.wallet_transactions for select to authenticated
  using (technician_id = (select auth.uid()) or (select app_private.is_marketplace_admin()));

drop policy if exists "Request participants and technicians can read request photos" on storage.objects;
create policy "Request participants technicians and admins can read request photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-photos'
    and (
      (select app_private.is_marketplace_admin())
      or (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.service_requests r
        join public.profiles p on p.id = (select auth.uid())
        where r.id::text = (storage.foldername(name))[2]
          and p.role = 'technician' and r.status = 'published'
      )
      or exists (
        select 1 from public.services s
        where s.request_id::text = (storage.foldername(name))[2]
          and (s.client_id = (select auth.uid()) or s.technician_id = (select auth.uid()))
      )
    )
  );

drop function if exists public.is_marketplace_admin();
