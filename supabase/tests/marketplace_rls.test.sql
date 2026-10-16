begin;
select plan(14);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'client-one@test.invalid', '{"role":"client"}'),
  ('22222222-2222-4222-8222-222222222222', 'client-two@test.invalid', '{"role":"client"}'),
  ('33333333-3333-4333-8333-333333333333', 'tech-one@test.invalid', '{"role":"technician"}'),
  ('44444444-4444-4444-8444-444444444444', 'tech-two@test.invalid', '{"role":"technician"}'),
  ('55555555-5555-4555-8555-555555555555', 'admin@test.invalid', '{"role":"client"}');

update public.profiles
set role = 'admin'
where id = '55555555-5555-4555-8555-555555555555';

insert into public.service_requests (id, client_id, category, title, description, sector, budget_cop, payment_method, desired_date, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Plomería', 'Solicitud asignada', 'Prueba de privacidad', 'El Poblado', 100000, 'cash', 'Hoy', 'assigned'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Pintura', 'Solicitud pública', 'Prueba de radar', 'Laureles', 120000, 'cash', 'Mañana', 'published');

insert into public.request_private_details (request_id, exact_address)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Dirección privada de prueba 1'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Dirección privada de prueba 2');

insert into public.services (request_id, client_id, technician_id, agreed_price_cop, commission_cop, payment_method, status)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 100000, 10000, 'cash', 'assigned');

set local role anon;
select throws_ok(
  $$select exact_address from public.request_private_details$$,
  '42501', null,
  'anonymous users cannot read private addresses'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select results_eq(
  $$select exact_address from public.request_private_details where request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array['Dirección privada de prueba 1'],
  'a client can read the exact address of their own request'
);
select is_empty(
  $$select id from public.service_requests where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'a client cannot read another client request'
);
select throws_ok(
  $$update public.service_requests set status = 'completed' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  '42501', null,
  'a client cannot update request status directly'
);
select throws_ok(
  $$update public.profiles set role = 'admin' where id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null,
  'a client cannot promote their own role'
);

set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
select results_eq(
  $$select id from public.service_requests where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid],
  'the assigned technician can read the assigned request'
);
select results_eq(
  $$select exact_address from public.request_private_details where request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array['Dirección privada de prueba 1'],
  'the assigned technician can read the exact address'
);
select throws_ok(
  $$insert into public.offers (request_id, technician_id, price_cop, message)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 50000, '')$$,
  '42501', null,
  'a technician cannot submit an offer against an assigned request'
);

set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
select is_empty(
  $$select id from public.service_requests where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'an unrelated technician cannot read an assigned request'
);
select is_empty(
  $$select exact_address from public.request_private_details where request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'an unrelated technician cannot read the assigned address'
);
select results_eq(
  $$select id from public.service_requests where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  array['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid],
  'a technician can read a published request in the radar'
);
select is_empty(
  $$select exact_address from public.request_private_details where request_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  'a technician cannot read the exact address before assignment'
);

set local request.jwt.claim.sub = '55555555-5555-4555-8555-555555555555';
select results_eq(
  $$select id from public.service_requests where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid],
  'an admin can inspect service requests'
);
select is_empty(
  $$select exact_address from public.request_private_details where request_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,
  'the admin dashboard does not expose exact addresses'
);

select * from finish();
rollback;
