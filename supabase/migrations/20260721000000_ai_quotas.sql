-- =====================================================================
-- COTAS DE IA — controla o gasto de IA. Plano PRO (único hoje):
--   • carteira ...... 1x por semana
--   • demais IA ..... 1x por dia
-- As duas ZERAM na MEIA-NOITE de São Paulo (diária = toda meia-noite;
-- semanal = meia-noite do 7º dia). Contador DURÁVEL por usuário, travado
-- no SERVIDOR (função definer), que o cliente NÃO burla.
-- Idempotente, nada destrutivo. Rode no Supabase → SQL Editor (cole tudo → Run).
-- =====================================================================

-- Plano do usuário. Hoje TODO logado é 'pro' (coluna fica pronta pro futuro).
alter table public.profiles add column if not exists plan text not null default 'pro';

-- Uso de IA por usuário+ação (1 linha por par).
create table if not exists public.ai_usage (
  user_id      uuid not null references auth.users(id) on delete cascade,
  action       text not null,
  window_start timestamptz not null default now(),
  count        int  not null default 0,
  primary key (user_id, action)
);
alter table public.ai_usage enable row level security;

-- O usuário só LÊ o próprio uso; NINGUÉM escreve pelo cliente (só as funções definer abaixo).
drop policy if exists "ai_usage: dono le" on public.ai_usage;
create policy "ai_usage: dono le" on public.ai_usage
  for select to authenticated using ((select auth.uid()) = user_id);

-- Quando a cota RESETA: meia-noite de São Paulo do dia seguinte (diária)
-- ou do 7º dia (carteira). Ancorado no fuso, então "zera à meia-noite".
create or replace function public._quota_reset(p_action text, p_start timestamptz)
returns timestamptz
language sql stable set search_path = public as $$
  select (date_trunc('day', p_start at time zone 'America/Sao_Paulo')
          + case when p_action = 'carteira' then interval '7 days' else interval '1 day' end)
         at time zone 'America/Sao_Paulo';
$$;

-- CONSOME 1 uso de forma ATÔMICA (trava a linha). Retorna se liberou + quando reseta.
create or replace function public.consume_quota(p_action text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_lim int := 1;                 -- Pro: 1 por janela (diária ou semanal)
  v_start timestamptz; v_count int;
  v_now timestamptz := now();
  v_reset timestamptz;
begin
  if v_user is null then
    return json_build_object('allowed', false, 'error', 'nao_autenticado');
  end if;

  insert into public.ai_usage (user_id, action, window_start, count)
  values (v_user, p_action, v_now, 0)
  on conflict (user_id, action) do nothing;

  select window_start, count into v_start, v_count
  from public.ai_usage where user_id = v_user and action = p_action for update;

  v_reset := public._quota_reset(p_action, v_start);
  if v_now >= v_reset then                       -- passou a meia-noite (ou a semana) → reinicia
    v_start := v_now; v_count := 0;
    v_reset := public._quota_reset(p_action, v_start);
  end if;

  if v_count >= v_lim then
    update public.ai_usage set window_start = v_start where user_id = v_user and action = p_action;
    return json_build_object('allowed', false, 'remaining', 0, 'limit', v_lim, 'reset_at', v_reset);
  end if;

  update public.ai_usage set window_start = v_start, count = v_count + 1
  where user_id = v_user and action = p_action;
  return json_build_object('allowed', true, 'remaining', v_lim - (v_count + 1), 'limit', v_lim, 'reset_at', v_reset);
end;
$$;

-- ESTORNA (se a IA falhar depois de consumir).
create or replace function public.refund_quota(p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then return; end if;
  update public.ai_usage set count = greatest(0, count - 1)
  where user_id = v_user and action = p_action;
end;
$$;

-- LÊ a cota SEM consumir (pro timer da tela).
create or replace function public.quota_status(p_action text)
returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_lim int := 1;
  v_start timestamptz; v_count int; v_now timestamptz := now(); v_reset timestamptz;
begin
  if v_user is null then return json_build_object('remaining', 0, 'limit', 0, 'reset_at', null); end if;
  select window_start, count into v_start, v_count
  from public.ai_usage where user_id = v_user and action = p_action;
  if v_start is null then
    return json_build_object('remaining', v_lim, 'limit', v_lim, 'reset_at', null);
  end if;
  v_reset := public._quota_reset(p_action, v_start);
  if v_now >= v_reset then
    return json_build_object('remaining', v_lim, 'limit', v_lim, 'reset_at', null);
  end if;
  return json_build_object('remaining', greatest(0, v_lim - v_count), 'limit', v_lim, 'reset_at', v_reset);
end;
$$;

grant execute on function public.consume_quota(text)  to authenticated;
grant execute on function public.refund_quota(text)   to authenticated;
grant execute on function public.quota_status(text)   to authenticated;

-- Pronto: Pro = carteira 1x/semana + demais IA 1x/dia, zerando à meia-noite de SP.
