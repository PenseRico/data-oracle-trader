Auditorias consolidadas. Confirmei o schema real nas 3 migrations (`20260325022306_*.sql`, `20260607000000_harden_setups_rls.sql`, `20260717000000_admin_single.sql`) e no `ProfilePage.tsx`. Entregáveis prontos abaixo.

---

## PARTE 1 — MIGRATION SQL

Salvar como `supabase/migrations/20260720000000_indexes_rls_hardening.sql` (ou colar no SQL Editor). Tudo idempotente, sem nada destrutivo.

```sql
-- =====================================================================
-- Crypto Rico / data-oracle-hub — Índices + Hardening de RLS/Storage
-- Idempotente. Nada destrutivo (sem DROP TABLE / DELETE de dados).
-- =====================================================================

-- ---------- 1) ÍNDICES (hoje só existem as PRIMARY KEYs) -------------
-- alerts: RLS filtra por user_id em toda leitura e o front ordena por data.
create index if not exists idx_alerts_user_id_created_at on public.alerts   (user_id, created_at desc);
-- setups: feed público ordena por data; user_id acelera cascade delete e o count por dono.
create index if not exists idx_setups_created_at         on public.setups   (created_at desc);
create index if not exists idx_setups_user_id            on public.setups   (user_id);
-- messages: chat ordena por data; user_id acelera cascade delete e checagem de FK.
create index if not exists idx_messages_created_at       on public.messages (created_at desc);
create index if not exists idx_messages_user_id          on public.messages (user_id);

-- Atualiza estatísticas pro planner passar a usar os índices.
analyze public.alerts;
analyze public.setups;
analyze public.messages;

-- ---------- 2) STORAGE chat-images: travar pasta pelo dono + DELETE --
-- INSERT: só grava se o 1º nível do path for o próprio uid ("<uid>/arquivo.ext").
drop policy if exists "Authenticated users can upload chat images" on storage.objects;
drop policy if exists "chat-images: dono envia na propria pasta"    on storage.objects;
create policy "chat-images: dono envia na propria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- UPDATE: só mexe na própria pasta (fecha brecha caso alguém habilite upsert).
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

-- SELECT público mantido (necessário pro <img src=publicUrl> funcionar sem login).
drop policy if exists "Anyone can view chat images" on storage.objects;
drop policy if exists "chat-images: leitura publica" on storage.objects;
create policy "chat-images: leitura publica"
  on storage.objects for select using (bucket_id = 'chat-images');

-- Limite de tamanho (2 MB) e tipos permitidos direto no bucket.
update storage.buckets
set file_size_limit    = 2097152,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif']
where id = 'chat-images';

-- ---------- 3) FUNÇÕES SECURITY DEFINER endurecidas ------------------
-- handle_new_user: search_path='' + NUNCA mais usar pedaço do e-mail como username (PII).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username',''),
      'trader_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- is_admin: mesma lógica, search_path='' por consistência.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

-- ---------- 4) MODERAÇÃO DO ADMIN (policies somadas por OR) ----------
-- Admin apaga QUALQUER mensagem (a policy do dono continua valendo).
drop policy if exists "admin apaga qualquer mensagem" on public.messages;
create policy "admin apaga qualquer mensagem"
  on public.messages for delete to authenticated using ( public.is_admin() );

-- Admin apaga QUALQUER setup.
drop policy if exists "admin apaga qualquer setup" on public.setups;
create policy "admin apaga qualquer setup"
  on public.setups for delete to authenticated using ( public.is_admin() );

-- Admin edita/corrige QUALQUER setup (moderação).
drop policy if exists "admin edita qualquer setup" on public.setups;
create policy "admin edita qualquer setup"
  on public.setups for update to authenticated
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- 5) RLS mais leve: (select auth.uid()) avaliado 1x --------
-- Envolver em subselect faz o Postgres calcular uma vez só e usar o índice.
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

-- ---------- 6) Limpeza de usernames que ainda são o e-mail (PII) -----
-- Só troca onde o username == local-part do e-mail; não apaga dado nenhum.
update public.profiles p
set username = 'trader_' || substr(p.id::text, 1, 8)
from auth.users u
where u.id = p.id
  and p.username = split_part(u.email, '@', 1);

-- ---------- 7) Anti-spam: teto de tamanho da mensagem ---------------
alter table public.messages
  add constraint messages_content_len check (char_length(content) <= 2000) not valid;
alter table public.messages validate constraint messages_content_len;

-- ---------- 8) Tetos de segurança do banco --------------------------
-- Query travada não segura o banco pros outros; libera conexão presa (serverless).
alter role authenticated set statement_timeout = '10s';
alter role anon          set statement_timeout = '10s';
alter role authenticated set idle_in_transaction_session_timeout = '30s';
```

Nota: o único `add constraint` sem `if not exists` é o `messages_content_len` — rodar de novo dá erro "constraint já existe". Se precisar reexecutar, remova o bloco 7 ou faça `alter table public.messages drop constraint if exists messages_content_len;` antes. O resto é 100% reexecutável.

---

## PARTE 2 — CORREÇÕES DE CÓDIGO

**`src/pages/ProfilePage.tsx`** (linhas 21-22)
- Bug de dado + query mais cara do app: o count de `setups` roda sem filtro e, como a policy é `USING(true)`, conta os setups de TODO mundo (full scan). Adicionar `.eq("user_id", user.id)` no count de setups. No de alerts a RLS já isola, mas trocar `select("*")` por `select("id")` nos dois.
- Trocar dep do `useEffect` de `[user]` para `[user?.id]` (evita refetch a cada refresh de token).

**`src/pages/CommunityPage.tsx`**
- `fetchMessages`: hoje `.order("created_at",{ascending:true}).limit(200)` traz as 200 mais ANTIGAS — com a tabela crescendo, o chat nunca mostra as recentes. Trocar para `ascending:false` + `.reverse()` no cliente (pega as 200 mais recentes e usa o índice).
- Selecionar colunas explícitas no lugar de `*` no join: `id, user_id, content, image_url, created_at, profiles(username, avatar_url)`.
- Realtime INSERT: parar de fazer `fetchSingleMessage` (SELECT extra por mensagem, em cada cliente). Usar `payload.new` direto + cache de perfis (`useRef<Map>`) buscando o perfil de cada autor só 1x (por PK). Dedup por `id` antes de anexar.
- `totalMembers`: envolver `new Set(messages.map(...)).size` em `useMemo(..., [messages])`.

**`src/components/community/SetupFeed.tsx`**
- `fetchSetups`: adicionar `.limit(50)` (hoje traz a tabela inteira, cresce pra sempre) e colunas explícitas (`coin_id` é buscado e nunca usado na UI).
- Realtime INSERT: em vez de `fetchSetups()` (refetch total a cada setup de qualquer um), buscar só a linha nova por `id` e prepender no estado.

**`src/pages/AlertsPage.tsx`**
- `toggleAlert`: parar de chamar `fetchAlerts()` após o update; atualizar o estado local com `.map` (como o `deleteAlert` já faz).
- `handleCreate`: usar `.select().single()` no insert e prepender o retorno, em vez de refetch.
- Trocar dep do effect para `[user?.id]`; `.limit(100)` de segurança e colunas explícitas.

**`src/integrations/supabase/client.ts`**
- Trocar `flowType: "implicit"` por `flowType: "pkce"` (token deixa de voltar no fragmento da URL / histórico / referrer).

**(Opcional, maior refactor)** migrar as leituras Supabase de `useState`+`useEffect` para `useQuery` — o `QueryClientProvider` já está montado no app mas nenhuma query do Supabase usa cache/dedup. Ganho maior em `ProfilePage` (counts cacheados por `user.id`) e `SetupFeed`.

---

## PARTE 3 — AÇÕES NO PAINEL [Supabase dashboard]

1. **Storage → chat-images → Edit bucket:** File size limit = 2 MB; Allowed MIME types = `image/png, image/jpeg, image/webp, image/gif`. (Já coberto no SQL da Parte 1, faça pelo painel só se preferir.)
2. **Authentication → Passwords:** ligar *"Check against HaveIBeenPwned"* (bloqueia senha vazada) — um toggle.
3. **Authentication → Multi-Factor:** habilitar TOTP (MFA), ao menos para a conta admin `pensericodigital@gmail.com`.
4. **Project Settings → Database → Connection string:** apontar as funções `/api/*` da Vercel para o **Transaction pooler (porta 6543)**, não conexão direta (5432) — evita esgotar conexões em picos serverless.
5. **Database → Advisors (Performance Advisor):** rodar depois de aplicar a migration para confirmar que os avisos de "FK sem índice" e "RLS lenta" zeraram.

---

## PARTE 4 — RESUMO LEIGO

**Velocidade:** hoje o banco lê tabelas inteiras toda vez (nenhum índice existia); os índices novos fazem o chat, o feed e o perfil pularem direto pro que interessa, já na ordem certa. **Peso:** o app parava de se atrapalhar sozinho — o chat estava carregando mensagens velhas em vez das novas, o perfil contava os setups do mundo inteiro, e cada mensagem/setup disparava uma enxurrada de consultas repetidas; tudo isso foi enxugado. **Proteção:** o pedaço do e-mail das pessoas deixa de aparecer no chat, cada um só grava/apaga imagem na sua própria pasta, você (admin) passa a poder moderar (apagar mensagem/setup de qualquer um), e o login fica no padrão seguro. Nada foi apagado — só travas, índices e correções, todas seguras de rodar.
