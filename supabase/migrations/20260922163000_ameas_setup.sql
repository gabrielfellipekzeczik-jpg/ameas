-- AMEAS em um Supabase compartilhado.
-- Todos os objetos possuem prefixo ameas_ e não conflitam com outros sites.
create extension if not exists pgcrypto;

create table if not exists public.ameas_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.ameas_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.ameas_admin_users where user_id = auth.uid());
$$;

create table if not exists public.ameas_site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.ameas_site_content (key, value) values
  ('hero_title', 'Esporte adaptado. Inclusão que transforma.'),
  ('hero_subtitle', 'A AMEAS promove acolhimento, autonomia e superação por meio do esporte adaptado em São Roque e região.'),
  ('about_text', 'A AMEAS é uma associação que acredita no esporte como caminho de inclusão, desenvolvimento e pertencimento para pessoas com deficiência e suas famílias.'),
  ('contact_whatsapp', '(11) 99943-3480'),
  ('pix_key', '34017976/0001-99'),
  ('instagram_url', 'https://www.instagram.com/')
on conflict (key) do nothing;

create table if not exists public.ameas_gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt text not null default 'Imagem da AMEAS',
  image_url text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ameas_partners (
  slug text primary key,
  name text not null,
  website_url text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true
);

insert into public.ameas_partners (slug, name, sort_order) values
  ('rua-hum', 'Rua Hum', 1),
  ('escola-aquarela', 'Escola Aquarela', 2),
  ('ibicolor', 'Ibicolor', 3),
  ('vila-don-patto', 'Vila Don Patto', 4),
  ('unimed-sao-roque', 'Unimed São Roque', 5),
  ('emporio-qn', 'Empório QN', 6),
  ('tia-lina', 'Tia Lina', 7),
  ('fernando-araujo', 'Fernando Araújo Artista Plástico', 8),
  ('qualiser', 'Qualiser Contabilidade', 9),
  ('jornal-da-economia', 'Jornal da Economia', 10)
on conflict (slug) do nothing;

alter table public.ameas_admin_users enable row level security;
alter table public.ameas_site_content enable row level security;
alter table public.ameas_gallery_items enable row level security;
alter table public.ameas_partners enable row level security;

create policy "ameas admins can read own profile" on public.ameas_admin_users for select to authenticated using (user_id = auth.uid());
create policy "ameas public can read content" on public.ameas_site_content for select using (true);
create policy "ameas public can read published gallery" on public.ameas_gallery_items for select using (published = true);
create policy "ameas public can read published partners" on public.ameas_partners for select using (published = true);
create policy "ameas admins can write content" on public.ameas_site_content for all to authenticated using (public.ameas_is_admin()) with check (public.ameas_is_admin());
create policy "ameas admins can write gallery" on public.ameas_gallery_items for all to authenticated using (public.ameas_is_admin()) with check (public.ameas_is_admin());
create policy "ameas admins can write partners" on public.ameas_partners for all to authenticated using (public.ameas_is_admin()) with check (public.ameas_is_admin());

insert into storage.buckets (id, name, public) values ('ameas-site-media', 'ameas-site-media', true)
on conflict (id) do nothing;
create policy "ameas public can view media" on storage.objects for select using (bucket_id = 'ameas-site-media');
create policy "ameas admins can upload media" on storage.objects for insert to authenticated with check (bucket_id = 'ameas-site-media' and public.ameas_is_admin());
create policy "ameas admins can update media" on storage.objects for update to authenticated using (bucket_id = 'ameas-site-media' and public.ameas_is_admin());
create policy "ameas admins can delete media" on storage.objects for delete to authenticated using (bucket_id = 'ameas-site-media' and public.ameas_is_admin());

-- Depois de criar o usuário em Authentication > Users:
-- insert into public.ameas_admin_users (user_id) values ('UUID_DO_USUARIO_ADMIN');
