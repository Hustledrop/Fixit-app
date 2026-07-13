-- FixIt Supabase Database Setup — paste into Supabase → SQL Editor → Run

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  is_pro              boolean not null default false,
  plan                text,                      -- 'monthly' | 'lifetime' | null
  stripe_customer_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow insert on signup"       on public.profiles for insert with check (auth.uid() = id);

-- ─── USAGE ───────────────────────────────────────────────────────────────────
create table if not exists public.usage (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  diagnosis_count  int not null default 0,
  free_limit       int not null default 1,
  updated_at       timestamptz not null default now()
);

alter table public.usage enable row level security;
create policy "Users can view own usage"   on public.usage for select using (auth.uid() = user_id);
create policy "Users can update own usage" on public.usage for update using (auth.uid() = user_id);
create policy "Allow insert on signup"     on public.usage for insert with check (auth.uid() = user_id);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  stripe_customer_id  text,
  stripe_session_id   text unique,
  plan                text,
  status              text,
  created_at          timestamptz not null default now()
);

alter table public.payments enable row level security;
create policy "Users can view own payments" on public.payments for select using (auth.uid() = user_id);
-- webhook uses service role key which bypasses RLS, so no insert policy needed for users

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, is_pro, created_at, updated_at)
  values (new.id, new.email, false, now(), now())
  on conflict (id) do nothing;

  insert into public.usage (user_id, diagnosis_count, free_limit, updated_at)
  values (new.id, 0, 1, now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── MANUAL PRO GRANT (testing) ──────────────────────────────────────────────
-- update public.profiles set is_pro = true, plan = 'lifetime' where email = 'you@example.com';
