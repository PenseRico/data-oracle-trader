-- =====================================================================
-- Crypto Rico / data-oracle-hub — Índices + Hardening de RLS/Storage
-- Otimização de velocidade + proteção de dados. 100% idempotente.
-- NADA destrutivo (sem DROP TABLE / DELETE de dados).
-- Rode no Supabase → SQL Editor (cole tudo → Run).
-- =====================================================================

-- ---------- 1) ÍNDICES (hoje só existem as PRIMARY KEYs) -------------
-- Sem índice, cada leitura filtrada por usuário / ordenada por data varre a tabela inteira.
create index if not exists idx_alerts_user_id_created on public.alerts   (user_id, created_at desc);
create index if not exists idx_setups_created_at       on public.setups   (created_at desc);
create index if not exists idx_setups_user_id          on public.setups   (user_id);
create index if not exists idx_messages_created_at     on public.messages (created_at desc);
create index if not exists idx_messages_user_id        on public.messages (user_id);

analyze public.alerts;
analyze public.setups;
analyze public.messages;

-- ---------- 2) STORAGE chat-images: cada um só na sua pasta ----------
drop policy if exists "Authenticated users can upload chat images" on storage.objects;
drop policy if exists "chat-images: dono envia na propria pasta"    on storage.objects;
create policy "chat-images: dono envia na propria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "chat-images: dono atualiza a propria pasta" on storage.objects;
create policy "chat-images: dono atualiza a propria pasta"
  on storage.objects for update to authenticated
  using      (bucket_id = 'chat-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'chat-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- DELETE: dono apaga a própria imagem OU admin apaga qualquer uma (moderação).
drop policy if exists "chat-images: dono ou admin apaga" on storage.objects;
create policy "chat-images: dono ou admin apaga"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'chat-images'
    and ( (storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin() )
  );

-- SELECT público mantido (o <img src=publicUrl> precisa carregar sem login).
drop policy if exists "Anyone can view chat images" on storage.objects;
drop policy if exists "chat-images: leitura publica" on storage.objects;
create policy "chat-images: leitura publica"
  on storage.objects for select using (bucket_id = 'chat-images');

-- Limite de tamanho (2 MB) e tipos permitidos no bucket.
update storage.buckets
set file_size_limit    = 2097152,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif']
where id = 'chat-images';

-- ---------- 3) FUNÇÕES SECURITY DEFINER endurecidas ------------------
-- handle_new_user: search_path fixo + NÃO usa mais o pedaço do e-mail como username (evita PII no chat).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      'trader_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

-- ---------- 4) MODERAÇÃO DO ADMIN (policies somadas por OR) ----------
drop policy if exists "admin apaga qualquer mensagem" on public.messages;
create policy "admin apaga qualquer mensagem"
  on public.messages for delete to authenticated using ( public.is_admin() );

drop policy if exists "admin apaga qualquer setup" on public.setups;
create policy "admin apaga qualquer setup"
  on public.setups for delete to authenticated using ( public.is_admin() );

drop policy if exists "admin edita qualquer setup" on public.setups;
create policy "admin edita qualquer setup"
  on public.setups for update to authenticated
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- 5) RLS mais leve: (select auth.uid()) avaliado 1x --------
drop policy if exists "Users can read own alerts"   on public.alerts;
create policy "Users can read own alerts"   on public.alerts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert own alerts" on public.alerts;
create policy "Users can insert own alerts" on public.alerts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own alerts" on public.alerts;
create policy "Users can update own alerts" on public.alerts for update to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own alerts" on public.alerts;
create policy "Users can delete own alerts" on public.alerts for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own messages" on public.messages;
create policy "Users can insert own messages" on public.messages for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own messages" on public.messages;
create policy "Users can delete own messages" on public.messages for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own setups" on public.setups;
create policy "Users can insert own setups" on public.setups for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own setups" on public.setups;
create policy "Users can update own setups" on public.setups for update to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own setups" on public.setups;
create policy "Users can delete own setups" on public.setups for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- 6) Privacidade: usernames que ainda são o pedaço do e-mail
update public.profiles p
set username = 'trader_' || substr(p.id::text, 1, 8)
from auth.users u
where u.id = p.id
  and p.username is not null
  and p.username = split_part(u.email, '@', 1);

-- ---------- 7) Anti-spam: teto de tamanho da mensagem (2000 chars) ---
alter table public.messages drop constraint if exists messages_content_len;
alter table public.messages add  constraint messages_content_len check (char_length(content) <= 2000);

-- Pronto. Índices + travas de segurança + moderação do admin aplicados.
