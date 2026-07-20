/**
 * useQuota — lê no servidor quanto ainda resta da cota de IA (sem consumir)
 * e mantém um contador regressivo "próxima análise em Xd Xh" pra tela.
 * A cota real é travada no banco (consume_quota); aqui é só pro visual.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface QuotaState {
  remaining: number;
  limit: number;
  resetAt: string | null; // ISO; quando a cota volta (null = disponível agora)
  loading: boolean;
}

/** Formata o tempo restante: "3d 5h", "5h 12m", "42min", "libera já". */
export function formatEta(resetAt: string | null): string {
  if (!resetAt) return "";
  const ms = new Date(resetAt).getTime() - Date.now();
  if (ms <= 0) return "libera já";
  const min = Math.floor(ms / 60000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export function useQuota(action: string) {
  const [state, setState] = useState<QuotaState>({ remaining: 1, limit: 1, resetAt: null, loading: true });
  const [, force] = useState(0); // re-render de 1 em 1 min pro contador andar

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setState({ remaining: 0, limit: 0, resetAt: null, loading: false });
      return;
    }
    // cast: funções novas ainda não estão nos tipos gerados do Supabase
    const { data, error } = await (supabase as any).rpc("quota_status", { p_action: action });
    if (error || !data) {
      // Sem a função no banco ainda → não trava a tela (deixa usar).
      setState({ remaining: 1, limit: 1, resetAt: null, loading: false });
      return;
    }
    const d = data as { remaining?: number; limit?: number; reset_at?: string | null };
    setState({
      remaining: Number(d.remaining ?? 1),
      limit: Number(d.limit ?? 1),
      resetAt: d.reset_at ?? null,
      loading: false,
    });
  }, [action]);

  useEffect(() => { refresh(); }, [refresh]);

  // Tick de minuto pro contador atualizar sozinho.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const exhausted = !state.loading && state.remaining <= 0;
  return { ...state, exhausted, eta: formatEta(state.resetAt), refresh };
}
