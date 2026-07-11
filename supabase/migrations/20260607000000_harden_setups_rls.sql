-- Cria a tabela public.setups (o código usa mas ela nunca foi criada) + Row Level Security.
-- Idempotente: pode rodar de novo sem erro.

CREATE TABLE IF NOT EXISTS public.setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'long',
  entry_price NUMERIC NOT NULL,
  target_price NUMERIC,
  stop_loss NUMERIC,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read setups" ON public.setups;
CREATE POLICY "Anyone authenticated can read setups"
  ON public.setups FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own setups" ON public.setups;
CREATE POLICY "Users can insert own setups"
  ON public.setups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own setups" ON public.setups;
CREATE POLICY "Users can update own setups"
  ON public.setups FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own setups" ON public.setups;
CREATE POLICY "Users can delete own setups"
  ON public.setups FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Realtime (o feed da comunidade escuta INSERT em setups)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.setups;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
