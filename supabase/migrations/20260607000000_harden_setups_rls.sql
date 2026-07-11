-- Hardening de segurança: garante Row Level Security na tabela public.setups.
-- A tabela existe (usada em SetupFeed/ProfilePage) mas NÃO estava nas migrations,
-- então o RLS dela não era verificável. Sem RLS, a anon key pública dá acesso total.
-- Este script é idempotente: pode rodar várias vezes sem erro.
-- Como aplicar: Supabase Dashboard → SQL Editor → cole e rode, OU `supabase db push`.

ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;

-- Leitura: feed da comunidade → qualquer usuário logado lê (igual à tabela messages)
DROP POLICY IF EXISTS "Anyone authenticated can read setups" ON public.setups;
CREATE POLICY "Anyone authenticated can read setups"
  ON public.setups FOR SELECT TO authenticated USING (true);

-- Escrita: só o dono (auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can insert own setups" ON public.setups;
CREATE POLICY "Users can insert own setups"
  ON public.setups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own setups" ON public.setups;
CREATE POLICY "Users can update own setups"
  ON public.setups FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own setups" ON public.setups;
CREATE POLICY "Users can delete own setups"
  ON public.setups FOR DELETE TO authenticated USING (auth.uid() = user_id);
