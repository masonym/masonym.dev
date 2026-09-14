-- =====================================================================
-- Burning Field Tracker - Supabase schema
-- Run this once in the Supabase SQL editor for the masonym.dev project.
-- Safe to re-run: everything is guarded with if-not-exists / drop-if-exists.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists burning_groups (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 60),
  -- map_name is the display name and stays required, because a group may be
  -- tracking a map the extracted catalogue does not have. map_id is the WZ map
  -- id when the group was created through the map picker, and it is the only
  -- thing that identifies a map unambiguously: 300 name+street pairs in the
  -- game name more than one map.
  map_name      text not null check (char_length(map_name) between 1 and 80),
  map_id        integer,
  map_street    text check (map_street is null or char_length(map_street) <= 80),
  world         text not null default 'Kronos' check (char_length(world) between 1 and 40),
  channel_count int  not null default 40 check (channel_count between 1 and 100),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  is_public     boolean not null default true,
  invite_code   text not null unique default encode(gen_random_bytes(4), 'hex'),
  created_at    timestamptz not null default now()
);

create table if not exists burning_group_members (
  group_id  uuid not null references burning_groups(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'logger' check (role in ('owner', 'logger', 'viewer')),
  ign       text,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- status:
--   free   = nobody in the map, burning is climbing
--   ours   = our party is training there, burning is draining
--   taken  = someone else is in the map (burning drains, and we can't use it);
--            assumed to still be there until somebody re-scouts the channel
--   camped = someone is parked in the map long-term, sitting on a burnt-out
--            map instead of channel-hopping; assumed to stay indefinitely
create table if not exists burning_logs (
  id          bigserial primary key,
  group_id    uuid not null references burning_groups(id) on delete cascade,
  channel     int  not null check (channel >= 1 and channel <= 100),
  level       int  not null check (level between 0 and 10),
  status      text not null default 'free' check (status in ('free', 'ours', 'taken', 'camped')),
  observed_at timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete set null,
  ign         text,
  note        text check (note is null or char_length(note) <= 200),
  -- true when nobody read this off the screen: the app wrote it because the
  -- occupancy markers changed, carrying the projected level forward under the
  -- status those markers now imply. Shown as "inferred" and never counted as a
  -- fresh reading.
  derived     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Backfill for installs created before occupancy started writing readings.
alter table burning_logs add column if not exists derived boolean not null default false;

-- Backfill for installs created before the map picker existed. Old groups keep
-- their free-text map_name and simply have no map_id.
alter table burning_groups add column if not exists map_id integer;
alter table burning_groups add column if not exists map_street text;

-- Widen the status check on databases created before `camped` existed. The
-- create-table above already has it; this fixes up existing installs.
do $$
begin
  alter table burning_logs drop constraint if exists burning_logs_status_check;
  alter table burning_logs add constraint burning_logs_status_check
    check (status in ('free', 'ours', 'taken', 'camped'));
end;
$$;

create index if not exists burning_logs_group_channel_idx
  on burning_logs (group_id, channel, observed_at desc);
create index if not exists burning_logs_group_observed_idx
  on burning_logs (group_id, observed_at desc);
create index if not exists burning_group_members_user_idx
  on burning_group_members (user_id);


-- Occupancy: who is standing in which channel right now. Deliberately manual -
-- nothing here reads the game, so a marker is only as true as the last person
-- who moved it. Rows with a user_id are group members; rows without one are
-- strangers somebody scouted, identified only by the name they were given.
create table if not exists burning_occupants (
  id        bigserial primary key,
  group_id  uuid not null references burning_groups(id) on delete cascade,
  channel   int  not null check (channel >= 1 and channel <= 100),
  user_id   uuid references auth.users(id) on delete cascade,
  label     text not null check (char_length(label) between 1 and 40),
  placed_by uuid references auth.users(id) on delete set null,
  placed_at timestamptz not null default now()
);

-- One person cannot be in two places at once. Members are identified by
-- user_id, strangers by their (case-insensitive) name within the group.
create unique index if not exists burning_occupants_member_idx
  on burning_occupants (group_id, user_id) where user_id is not null;
create unique index if not exists burning_occupants_stranger_idx
  on burning_occupants (group_id, lower(label)) where user_id is null;
create index if not exists burning_occupants_group_channel_idx
  on burning_occupants (group_id, channel);

-- ---------------------------------------------------------------------
-- Helpers (security definer so RLS policies don't recurse into themselves)
-- ---------------------------------------------------------------------

create or replace function burning_is_member(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from burning_group_members m
    where m.group_id = p_group_id and m.user_id = auth.uid()
  );
$$;

create or replace function burning_can_log(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from burning_group_members m
    where m.group_id = p_group_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'logger')
  );
$$;

create or replace function burning_is_owner(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from burning_groups g
    where g.id = p_group_id and g.owner_id = auth.uid()
  );
$$;

-- The group creator is always a member with the owner role.
create or replace function burning_add_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into burning_group_members (group_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (group_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

drop trigger if exists burning_groups_add_owner on burning_groups;
create trigger burning_groups_add_owner
  after insert on burning_groups
  for each row execute function burning_add_owner_membership();

-- Joining is done through this RPC so an invite code can be checked without
-- exposing codes of groups you are not in.
create or replace function burning_join_group(p_code text, p_ign text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group burning_groups%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;

  select * into v_group from burning_groups
  where lower(invite_code) = lower(btrim(p_code));

  if not found then
    raise exception 'no group with that invite code';
  end if;

  insert into burning_group_members (group_id, user_id, role, ign)
  values (v_group.id, auth.uid(), 'logger', nullif(btrim(coalesce(p_ign, '')), ''))
  on conflict (group_id, user_id) do nothing;

  return v_group.id;
end;
$$;

-- Joining a public group you found by browsing (no code needed).
create or replace function burning_join_public_group(p_group_id uuid, p_ign text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;

  if not exists (select 1 from burning_groups where id = p_group_id and is_public) then
    raise exception 'group is not open to join';
  end if;

  insert into burning_group_members (group_id, user_id, role, ign)
  values (p_group_id, auth.uid(), 'logger', nullif(btrim(coalesce(p_ign, '')), ''))
  on conflict (group_id, user_id) do nothing;

  return p_group_id;
end;
$$;

-- Flip a group between listed-publicly and invite-only. Owner only.
--
-- Going public -> private rotates the invite code, and that is the whole reason
-- this is an RPC rather than a plain update. `burning_groups_select` lets any
-- signed-in user read a public group's row, invite_code included, so every
-- stranger who browsed the group while it was public may be holding its code.
-- Without the rotation, "make this private" would not actually shut anyone out.
create or replace function burning_set_group_visibility(
  p_group_id uuid,
  p_is_public boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_was_public boolean;
  v_code       text;
begin
  if not burning_is_owner(p_group_id) then
    raise exception 'only the group owner can change visibility';
  end if;

  select is_public, invite_code into v_was_public, v_code
  from burning_groups where id = p_group_id;

  if v_was_public and not p_is_public then
    -- Retry on the (vanishingly unlikely) unique collision rather than
    -- surfacing a constraint violation to the user.
    loop
      begin
        v_code := encode(gen_random_bytes(4), 'hex');
        update burning_groups
          set is_public = false, invite_code = v_code
          where id = p_group_id;
        exit;
      exception when unique_violation then
        null; -- collided with an existing code, go round again
      end;
    end loop;
  else
    update burning_groups set is_public = p_is_public where id = p_group_id;
  end if;

  return v_code;
end;
$$;

-- Public browse list. Exposes counts but never invite codes.
-- Dropped first: the returned row type gained map_id/map_street, and Postgres
-- refuses to `create or replace` a function whose return type changed.
drop function if exists burning_public_groups(text);
create or replace function burning_public_groups(p_search text default null)
returns table (
  id uuid,
  name text,
  map_name text,
  map_id integer,
  map_street text,
  world text,
  channel_count int,
  member_count bigint,
  last_log_at timestamptz,
  is_member boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select g.id, g.name, g.map_name, g.map_id, g.map_street, g.world, g.channel_count,
         (select count(*) from burning_group_members m where m.group_id = g.id),
         (select max(l.observed_at) from burning_logs l where l.group_id = g.id),
         burning_is_member(g.id),
         g.created_at
  from burning_groups g
  where g.is_public
    and (
      p_search is null or btrim(p_search) = ''
      or g.name     ilike '%' || btrim(p_search) || '%'
      or g.map_name   ilike '%' || btrim(p_search) || '%'
      or g.map_street ilike '%' || btrim(p_search) || '%'
      or g.world      ilike '%' || btrim(p_search) || '%'
    )
  order by (select max(l.observed_at) from burning_logs l where l.group_id = g.id) desc nulls last,
           g.created_at desc
  limit 60;
$$;

-- Merging: move every log from the source group into the target group and
-- pull the source's members across. Only the owner of BOTH groups may do it.
create or replace function burning_merge_groups(p_source uuid, p_target uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_moved int;
begin
  if p_source = p_target then
    raise exception 'cannot merge a group into itself';
  end if;
  if not (burning_is_owner(p_source) and burning_is_owner(p_target)) then
    raise exception 'you must own both groups to merge them';
  end if;

  update burning_logs set group_id = p_target where group_id = p_source;
  get diagnostics v_moved = row_count;

  insert into burning_group_members (group_id, user_id, role, ign)
  select p_target, m.user_id, case when m.role = 'owner' then 'logger' else m.role end, m.ign
  from burning_group_members m
  where m.group_id = p_source
  on conflict (group_id, user_id) do nothing;

  delete from burning_groups where id = p_source;
  return v_moved;
end;
$$;


-- Place somebody in a channel, moving them off whatever channel they were on.
-- Doing it in one function is what makes "one person, one place" atomic; the
-- unique indexes above only stop a duplicate, they can't move the old row.
--
-- p_user_id set   -> a member of this group (label defaults to their IGN)
-- p_user_id null  -> a stranger, identified by p_label
create or replace function burning_set_occupant(
  p_group_id uuid,
  p_channel  int,
  p_user_id  uuid default null,
  p_label    text default null
)
returns burning_occupants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group burning_groups%rowtype;
  v_label text;
  v_count int;
  v_row   burning_occupants%rowtype;
begin
  if not burning_can_log(p_group_id) then
    raise exception 'you do not have permission to place markers in this group';
  end if;

  select * into v_group from burning_groups where id = p_group_id;
  if not found then
    raise exception 'no such group';
  end if;
  if p_channel < 1 or p_channel > v_group.channel_count then
    raise exception 'channel % is outside this group', p_channel;
  end if;

  v_label := nullif(btrim(coalesce(p_label, '')), '');

  if p_user_id is not null then
    -- Members carry a label too, so a marker still reads sensibly if they
    -- later change or clear their IGN.
    select coalesce(v_label, m.ign, 'member ' || left(p_user_id::text, 8))
      into v_label
      from burning_group_members m
     where m.group_id = p_group_id and m.user_id = p_user_id;
    if v_label is null then
      raise exception 'that user is not a member of this group';
    end if;
  elsif v_label is null then
    raise exception 'a name is required to mark somebody who is not in the group';
  end if;

  if p_user_id is not null then
    delete from burning_occupants
     where group_id = p_group_id and user_id = p_user_id;
  else
    delete from burning_occupants
     where group_id = p_group_id and user_id is null and lower(label) = lower(v_label);
  end if;

  -- A burning field map holds four players; the board refuses to draw a fifth.
  -- Counted after the delete above so moving somebody within a full channel
  -- is not mistaken for adding to it.
  select count(*) into v_count
    from burning_occupants
   where group_id = p_group_id and channel = p_channel;
  if v_count >= 4 then
    raise exception 'channel % is already full (4/4)', p_channel;
  end if;

  insert into burning_occupants (group_id, channel, user_id, label, placed_by)
  values (p_group_id, p_channel, p_user_id, v_label, auth.uid())
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------

alter table burning_groups        enable row level security;
alter table burning_group_members enable row level security;
alter table burning_logs          enable row level security;
alter table burning_occupants     enable row level security;

drop policy if exists burning_groups_select on burning_groups;
create policy burning_groups_select on burning_groups
  for select using (is_public or burning_is_member(id));

drop policy if exists burning_groups_insert on burning_groups;
create policy burning_groups_insert on burning_groups
  for insert with check (owner_id = auth.uid());

drop policy if exists burning_groups_update on burning_groups;
create policy burning_groups_update on burning_groups
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists burning_groups_delete on burning_groups;
create policy burning_groups_delete on burning_groups
  for delete using (owner_id = auth.uid());

drop policy if exists burning_members_select on burning_group_members;
create policy burning_members_select on burning_group_members
  for select using (user_id = auth.uid() or burning_is_member(group_id));

-- Owners manage roles; anyone can remove themselves (leave the group).
drop policy if exists burning_members_update on burning_group_members;
create policy burning_members_update on burning_group_members
  for update using (burning_is_owner(group_id) or user_id = auth.uid())
  with check (burning_is_owner(group_id) or user_id = auth.uid());

drop policy if exists burning_members_delete on burning_group_members;
create policy burning_members_delete on burning_group_members
  for delete using (burning_is_owner(group_id) or user_id = auth.uid());

drop policy if exists burning_logs_select on burning_logs;
create policy burning_logs_select on burning_logs
  for select using (burning_is_member(group_id));

drop policy if exists burning_logs_insert on burning_logs;
create policy burning_logs_insert on burning_logs
  for insert with check (user_id = auth.uid() and burning_can_log(group_id));

drop policy if exists burning_logs_delete on burning_logs;
create policy burning_logs_delete on burning_logs
  for delete using (user_id = auth.uid() or burning_is_owner(group_id));


-- Occupancy is a shared whiteboard: anyone who may log may also move or rub
-- out a marker, including one somebody else placed. Placement itself goes
-- through burning_set_occupant so the "one person, one place" rule holds.
drop policy if exists burning_occupants_select on burning_occupants;
create policy burning_occupants_select on burning_occupants
  for select using (burning_is_member(group_id));

drop policy if exists burning_occupants_insert on burning_occupants;
create policy burning_occupants_insert on burning_occupants
  for insert with check (burning_can_log(group_id));

drop policy if exists burning_occupants_update on burning_occupants;
create policy burning_occupants_update on burning_occupants
  for update using (burning_can_log(group_id)) with check (burning_can_log(group_id));

drop policy if exists burning_occupants_delete on burning_occupants;
create policy burning_occupants_delete on burning_occupants
  for delete using (burning_can_log(group_id));

-- ---------------------------------------------------------------------
-- Realtime (live updates for everyone looking at the same group)
-- ---------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table burning_logs;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table burning_occupants;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

-- DELETE events only carry the primary key under the default replica identity,
-- which means a `group_id=eq.` subscription filter drops them. Occupancy is the
-- one table where a missed delete is actively misleading ("Bob is still on 12"),
-- so it publishes whole rows.
alter table burning_occupants replica identity full;

