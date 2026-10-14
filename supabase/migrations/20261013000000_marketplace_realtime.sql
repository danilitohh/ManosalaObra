create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Usuario',
  role text not null check (role in ('client', 'technician')),
  rating numeric(2, 1) not null default 0,
  completed_services integer not null default 0,
  verified boolean not null default false,
  is_available boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.technician_wallets (
  technician_id uuid primary key references public.profiles(id) on delete cascade,
  balance_cop bigint not null default 0 check (balance_cop >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  category text not null,
  title text not null,
  description text not null,
  sector text not null,
  budget_cop bigint not null check (budget_cop > 0),
  payment_method text not null check (payment_method in ('cash', 'digital')),
  desired_date text not null,
  status text not null default 'published' check (status in (
    'published', 'selected', 'awaiting_balance', 'assigned', 'en_route',
    'in_progress', 'payment_pending', 'completed', 'cancelled'
  )),
  selected_offer_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.request_private_details (
  request_id uuid primary key references public.service_requests(id) on delete cascade,
  exact_address text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.request_media (
  request_id uuid primary key references public.service_requests(id) on delete cascade,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  technician_id uuid not null references public.profiles(id),
  price_cop bigint not null check (price_cop > 0),
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (request_id, technician_id)
);

alter table public.service_requests
  drop constraint if exists service_requests_selected_offer_id_fkey;
alter table public.service_requests
  add constraint service_requests_selected_offer_id_fkey
  foreign key (selected_offer_id) references public.offers(id) on delete set null;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id),
  client_id uuid not null references public.profiles(id),
  technician_id uuid not null references public.profiles(id),
  agreed_price_cop bigint not null check (agreed_price_cop > 0),
  commission_cop bigint not null check (commission_cop >= 0),
  payment_method text not null check (payment_method in ('cash', 'digital')),
  status text not null default 'assigned' check (status in (
    'assigned', 'en_route', 'in_progress', 'completion_pending',
    'completed', 'cancelled', 'payment_pending'
  )),
  address_revealed boolean not null default true,
  completion_confirmations text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.profiles(id),
  type text not null check (type in ('recharge', 'commission', 'commission_reversal')),
  amount_cop bigint not null check (amount_cop <> 0),
  description text not null,
  service_id uuid references public.services(id),
  created_at timestamptz not null default now()
);

create index if not exists service_requests_status_created_idx
  on public.service_requests (status, created_at desc);
create index if not exists service_requests_client_created_idx
  on public.service_requests (client_id, created_at desc);
create index if not exists offers_request_created_idx
  on public.offers (request_id, created_at desc);
create index if not exists offers_technician_created_idx
  on public.offers (technician_id, created_at desc);
create index if not exists services_client_status_idx
  on public.services (client_id, status);
create index if not exists services_technician_status_idx
  on public.services (technician_id, status);
create index if not exists wallet_transactions_technician_created_idx
  on public.wallet_transactions (technician_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_role text := coalesce(new.raw_user_meta_data ->> 'role', 'client');
begin
  if new_role not in ('client', 'technician') then
    new_role := 'client';
  end if;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Usuario'),
    new_role
  );

  if new_role = 'technician' then
    insert into public.technician_wallets (technician_id) values (new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_marketplace on auth.users;
create trigger on_auth_user_created_marketplace
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, role)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''), 'Usuario'),
  case when u.raw_user_meta_data ->> 'role' = 'technician' then 'technician' else 'client' end
from auth.users u
on conflict (id) do nothing;
insert into public.technician_wallets (technician_id)
select id from public.profiles where role = 'technician'
on conflict (technician_id) do nothing;

alter table public.profiles enable row level security;
alter table public.technician_wallets enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_private_details enable row level security;
alter table public.request_media enable row level security;
alter table public.offers enable row level security;
alter table public.services enable row level security;
alter table public.wallet_transactions enable row level security;

grant usage on schema public to authenticated;
grant select on public.profiles, public.technician_wallets, public.service_requests,
  public.request_private_details, public.request_media, public.offers, public.services, public.wallet_transactions
  to authenticated;
grant insert (client_id, category, title, description, sector, budget_cop, payment_method, desired_date)
  on public.service_requests to authenticated;
grant insert (request_id, exact_address)
  on public.request_private_details to authenticated;
grant insert (request_id, photo_paths) on public.request_media to authenticated;
grant insert (request_id, technician_id, price_cop, message)
  on public.offers to authenticated;
grant update (display_name, is_available) on public.profiles to authenticated;

create policy "Profiles visible to their owner and technicians"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or role = 'technician');
create policy "Users can update their display name"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Technicians can read their wallet"
  on public.technician_wallets for select to authenticated
  using (technician_id = (select auth.uid()));

create policy "Clients and nearby technicians can read requests"
  on public.service_requests for select to authenticated
  using (
    client_id = (select auth.uid())
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
create policy "Clients can publish their own requests"
  on public.service_requests for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and status = 'published'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'client')
  );

create policy "Private details visible only to the client and assigned technician"
  on public.request_private_details for select to authenticated
  using (
    exists (
      select 1 from public.service_requests r
      where r.id = request_private_details.request_id and r.client_id = (select auth.uid())
    )
    or exists (
      select 1 from public.services s
      where s.request_id = request_private_details.request_id and s.technician_id = (select auth.uid())
    )
  );
create policy "Clients can add private details to their own requests"
  on public.request_private_details for insert to authenticated
  with check (
    exists (
      select 1 from public.service_requests r
      where r.id = request_private_details.request_id and r.client_id = (select auth.uid())
    )
  );
create policy "Request participants can read request media"
  on public.request_media for select to authenticated
  using (
    exists (
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
create policy "Clients can add media to their own requests"
  on public.request_media for insert to authenticated
  with check (
    exists (
      select 1 from public.service_requests r
      where r.id = request_media.request_id and r.client_id = (select auth.uid())
    )
  );

create policy "Users can read related offers"
  on public.offers for select to authenticated
  using (
    technician_id = (select auth.uid())
    or exists (
      select 1 from public.service_requests r
      where r.id = offers.request_id and r.client_id = (select auth.uid())
    )
  );
create policy "Technicians can submit one offer per request"
  on public.offers for insert to authenticated
  with check (
    technician_id = (select auth.uid())
    and status = 'pending'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'technician')
    and exists (select 1 from public.service_requests r where r.id = request_id and r.status = 'published')
  );

create policy "Service participants can read their services"
  on public.services for select to authenticated
  using (client_id = (select auth.uid()) or technician_id = (select auth.uid()));
create policy "Technicians can read their wallet transactions"
  on public.wallet_transactions for select to authenticated
  using (technician_id = (select auth.uid()));

create or replace function public.select_service_offer(p_request_id uuid, p_offer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.service_requests%rowtype;
  offer_row public.offers%rowtype;
  wallet_balance bigint;
  commission bigint;
  created_service_id uuid;
begin
  select * into request_row from public.service_requests
    where id = p_request_id and client_id = (select auth.uid()) for update;
  if not found or request_row.status <> 'published' then
    raise exception 'La solicitud ya no está recibiendo propuestas.';
  end if;

  select * into offer_row from public.offers
    where id = p_offer_id and request_id = p_request_id and status = 'pending';
  if not found then raise exception 'La propuesta ya no está disponible.'; end if;

  commission := round(offer_row.price_cop * 0.10);
  if request_row.payment_method = 'cash' then
    select balance_cop into wallet_balance from public.technician_wallets
      where technician_id = offer_row.technician_id for update;
    if coalesce(wallet_balance, 0) < commission then
      raise exception 'El técnico aún no tiene saldo suficiente para cubrir la comisión.';
    end if;
    update public.technician_wallets set balance_cop = balance_cop - commission, updated_at = now()
      where technician_id = offer_row.technician_id;
  end if;

  insert into public.services (request_id, client_id, technician_id, agreed_price_cop, commission_cop, payment_method)
    values (p_request_id, request_row.client_id, offer_row.technician_id, offer_row.price_cop, commission, request_row.payment_method)
    returning id into created_service_id;

  if request_row.payment_method = 'cash' then
    insert into public.wallet_transactions (technician_id, type, amount_cop, description, service_id)
      values (offer_row.technician_id, 'commission', -commission, 'Comisión de administración · ' || request_row.category, created_service_id);
  end if;

  update public.service_requests set status = 'assigned', selected_offer_id = p_offer_id where id = p_request_id;
  update public.offers set status = case when id = p_offer_id then 'accepted' else 'rejected' end
    where request_id = p_request_id;
  return created_service_id;
end;
$$;

create or replace function public.advance_service(p_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  service_row public.services%rowtype;
  next_status text;
begin
  select * into service_row from public.services where id = p_service_id for update;
  if not found or service_row.technician_id <> (select auth.uid()) then raise exception 'Servicio no autorizado.'; end if;
  next_status := case service_row.status when 'assigned' then 'en_route' when 'en_route' then 'in_progress' else null end;
  if next_status is null then raise exception 'El servicio no puede avanzar desde este estado.'; end if;
  update public.services set status = next_status where id = p_service_id;
  update public.service_requests set status = next_status where id = service_row.request_id;
end;
$$;

create or replace function public.confirm_service_completion(p_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  service_row public.services%rowtype;
  actor_role text;
  confirmations text[];
  next_status text;
  request_status text;
begin
  select * into service_row from public.services where id = p_service_id for update;
  if not found or (service_row.client_id <> (select auth.uid()) and service_row.technician_id <> (select auth.uid())) then
    raise exception 'Servicio no autorizado.';
  end if;
  if service_row.status not in ('in_progress', 'completion_pending') then raise exception 'El servicio aún no se puede confirmar.'; end if;
  actor_role := case when service_row.client_id = (select auth.uid()) then 'client' else 'technician' end;
  select array_agg(distinct role) into confirmations
    from unnest(service_row.completion_confirmations || actor_role) as roles(role);
  next_status := case
    when 'client' = any(confirmations) and 'technician' = any(confirmations) and service_row.payment_method = 'digital' then 'payment_pending'
    when 'client' = any(confirmations) and 'technician' = any(confirmations) then 'completed'
    else 'completion_pending'
  end;
  request_status := case next_status when 'payment_pending' then 'payment_pending' when 'completed' then 'completed' else 'in_progress' end;
  update public.services set status = next_status, completion_confirmations = confirmations where id = p_service_id;
  update public.service_requests set status = request_status where id = service_row.request_id;
end;
$$;

create or replace function public.simulate_digital_payment(p_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare service_row public.services%rowtype;
begin
  select * into service_row from public.services where id = p_service_id for update;
  if not found or service_row.client_id <> (select auth.uid()) then raise exception 'Servicio no autorizado.'; end if;
  if service_row.payment_method <> 'digital' or service_row.status <> 'payment_pending' then raise exception 'El pago no está pendiente.'; end if;
  update public.services set status = 'completed' where id = p_service_id;
  update public.service_requests set status = 'completed' where id = service_row.request_id;
end;
$$;

create or replace function public.cancel_marketplace_service(p_service_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare service_row public.services%rowtype;
begin
  select * into service_row from public.services where id = p_service_id for update;
  if not found or (service_row.client_id <> (select auth.uid()) and service_row.technician_id <> (select auth.uid())) then
    raise exception 'Servicio no autorizado.';
  end if;
  if service_row.status in ('completed', 'cancelled') then raise exception 'El servicio ya está cerrado.'; end if;
  update public.services set status = 'cancelled' where id = p_service_id;
  update public.service_requests set status = 'cancelled' where id = service_row.request_id;
  if service_row.payment_method = 'cash' and service_row.commission_cop > 0 then
    update public.technician_wallets set balance_cop = balance_cop + service_row.commission_cop, updated_at = now()
      where technician_id = service_row.technician_id;
    insert into public.wallet_transactions (technician_id, type, amount_cop, description, service_id)
      values (service_row.technician_id, 'commission_reversal', service_row.commission_cop, 'Reverso de comisión por cancelación', p_service_id);
  end if;
end;
$$;

create or replace function public.cancel_marketplace_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.service_requests set status = 'cancelled'
    where id = p_request_id and client_id = (select auth.uid()) and status in ('published', 'awaiting_balance');
  if not found then raise exception 'La solicitud no se puede cancelar.'; end if;
end;
$$;

revoke all on function public.select_service_offer(uuid, uuid) from public, anon;
revoke all on function public.advance_service(uuid) from public, anon;
revoke all on function public.confirm_service_completion(uuid) from public, anon;
revoke all on function public.simulate_digital_payment(uuid) from public, anon;
revoke all on function public.cancel_marketplace_service(uuid) from public, anon;
revoke all on function public.cancel_marketplace_request(uuid) from public, anon;
grant execute on function public.select_service_offer(uuid, uuid) to authenticated;
grant execute on function public.advance_service(uuid) to authenticated;
grant execute on function public.confirm_service_completion(uuid) to authenticated;
grant execute on function public.simulate_digital_payment(uuid) to authenticated;
grant execute on function public.cancel_marketplace_service(uuid) to authenticated;
grant execute on function public.cancel_marketplace_request(uuid) to authenticated;

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
    raise exception 'Solo una cuenta de cliente puede publicar solicitudes.';
  end if;
  if nullif(trim(p_title), '') is null or nullif(trim(p_description), '') is null
    or nullif(trim(p_exact_address), '') is null or p_budget_cop <= 0
    or p_payment_method not in ('cash', 'digital') or coalesce(array_length(p_photo_paths, 1), 0) > 3 then
    raise exception 'Revisa la información de la solicitud.';
  end if;
  if exists (
    select 1 from unnest(coalesce(p_photo_paths, '{}')) as paths(path)
    where path not like (select auth.uid())::text || '/' || p_request_id::text || '/%'
  ) then raise exception 'Ruta de foto no autorizada.'; end if;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('request-photos', 'request-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Authenticated clients upload request photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Request participants and technicians can read request photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
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

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles', 'service_requests', 'request_media', 'offers', 'services', 'technician_wallets', 'wallet_transactions'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
