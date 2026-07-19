-- ─────────────────────────────────────────────────────────────────────────────
-- 0014_fix_handle_new_user_role_cast.sql
-- Fixes a bug introduced in 0013: the CASE expression choosing between 'admin'
-- and 'player' resolves to `text`, which has no implicit cast to the
-- `public.app_role` enum column — every new user creation (both self-serve
-- signup and admin.createUser) failed with "Database error creating new
-- user" until this is applied. Explicitly cast the CASE result to app_role.
--
-- Run this AFTER 0013_admin_seed_role.sql.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8));

  insert into public.profiles (id, username) values (new.id, v_username);

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    (case when lower(v_username) = 'admin@nhom8' then 'admin' else 'player' end)::public.app_role
  );

  return new;
end;
$$;
