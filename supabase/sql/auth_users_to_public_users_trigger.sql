-- Creates/updates a trigger that automatically creates a row in public."Users"
-- whenever a new auth.users row is created.
--
-- Why:
-- - Makes auth user creation and public profile creation atomic (same DB transaction).
-- - Prevents "auth user exists but public.Users row is missing" for new accounts.
--
-- Run this in the Supabase SQL editor (or via Supabase CLI migrations).

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
begin
  -- For email/password signup, you pass first/last via options.data in the client.
  -- For OAuth (Google), providers often populate full_name and other fields.
  full_name :=
    nullif(
      btrim(concat_ws(' ',
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name'
      )),
      ''
    );

  insert into public."Users" (user_id, user_email, user_name, team_id)
  values (
    new.id,
    new.email,
    coalesce(
      full_name,
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    null
  )
  on conflict (user_id) do update
    set user_email = excluded.user_email,
        user_name  = excluded.user_name;

  return new;

exception when others then
  -- If this fails, re-raise to roll back auth.users creation (atomicity).
  raise;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

