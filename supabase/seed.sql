-- The working account, which is also the test account (6.2).
--
-- One account, not two: 6.2 names both and they are the same. `alumno@crypto-crime.test`
-- uses a domain reserved by RFC 2606, so the address cannot be registered or
-- receive mail by accident, and the name says which project it belongs to.
--
-- `e2e/seeded-account.ts` holds the same two literals for the end-to-end suite.
-- SQL cannot import anything and `supabase db reset` passes no parameters, so
-- that second copy is unavoidable. Change this file first, then that one.
--
-- Applied by `supabase db reset`: `config.toml` already declares
-- `db.seed.enabled = true` and `sql_paths = ["./seed.sql"]`.

-- The id is a literal so the insert can settle on the primary key. `auth.users`
-- has no plain unique constraint on `email` — only the partial index
-- `users_email_partial_key … WHERE is_sso_user = false` — so `on conflict (email)`
-- is not a usable target.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  -- These eight are nullable in the database and must not be left null anyway.
  -- GoTrue scans them into Go strings, and a null blows the scan up: signing in
  -- returns 500 `{"error_code":"unexpected_failure","msg":"Database error
  -- querying schema"}` and `supabase_auth` logs `converting NULL to string is
  -- unsupported`. The empty string is safe across accounts: the unique indexes
  -- on these columns are partial, with predicate `!~ '^[0-9 ]*$'`, which leaves
  -- `''` out. `phone` may stay null.
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '9b2c4f8e-1d3a-4c5b-8e7f-2a6d0b4c9e13',
  'authenticated',
  'authenticated',
  'alumno@crypto-crime.test',
  -- `crypt()` and `gen_salt()` live in the `extensions` schema, which is on the
  -- default `search_path` of the `postgres` role; qualifying is the defensive form.
  extensions.crypt('investigacion-2024', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', '', '', '', '', ''
)
on conflict (id) do nothing;

-- Not what enables signing in: on GoTrue v2.195.0 an account with no row here
-- signs in fine and `getUser()` returns it. It is seeded because it is what
-- `auth.admin.createUser` produces, and without it `user.identities` comes back
-- empty. Recorded so that nobody meeting the 500 above suspects this table.
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '9b2c4f8e-1d3a-4c5b-8e7f-2a6d0b4c9e13',
  '9b2c4f8e-1d3a-4c5b-8e7f-2a6d0b4c9e13',
  '{"sub":"9b2c4f8e-1d3a-4c5b-8e7f-2a6d0b4c9e13","email":"alumno@crypto-crime.test","email_verified":true,"phone_verified":false}',
  'email',
  '9b2c4f8e-1d3a-4c5b-8e7f-2a6d0b4c9e13',
  now(),
  now(),
  now()
)
on conflict (provider_id, provider) do nothing;
