-- ─────────────────────────────────────────────────────────────────────────────
-- 0013_admin_seed_role.sql
-- Preconfigured admin handle: "admin@nhom8" gets the 'admin' role the moment
-- it first logs in (login auto-provisions accounts — see migration-0001's
-- on_auth_user_created trigger and features/auth/actions/sign-in.action.ts).
--
-- Replaces handle_new_user() (defined in 0001) rather than editing that file,
-- per this project's convention of never editing past migrations.
--
-- Run this AFTER 0001_init_foundation.sql.
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
    case when lower(v_username) = 'admin@nhom8' then 'admin' else 'player' end
  );

  return new;
end;
$$;
