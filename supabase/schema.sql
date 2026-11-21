-- Tứ Chiếu: bảng lưu lá số theo tài khoản. Dán toàn bộ vào Supabase → SQL Editor → Run (chạy một lần).
create table if not exists public.charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ckey text not null,                 -- khóa nhận diện lá số (tên, ngày, giờ, nơi sinh, giới tính)
  name text,
  data jsonb not null,                -- thông tin để lập lại lá số (ngày giờ, nơi sinh…), không lưu bài AI
  updated_at timestamptz not null default now(),
  unique (user_id, ckey)
);
alter table public.charts enable row level security;
-- mỗi người chỉ thấy và sửa được lá số của chính mình
drop policy if exists "charts_own" on public.charts;
create policy "charts_own" on public.charts for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists charts_user_updated on public.charts (user_id, updated_at desc);

-- Lưu thời điểm người dùng đồng ý chính sách bảo mật (để chứng minh khi cần)
create table if not exists public.profiles (
  id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  consent_version text,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Người dùng tự xóa tài khoản: xóa trong auth.users, các bảng trên tự xóa theo (on delete cascade)
create or replace function public.delete_me() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
