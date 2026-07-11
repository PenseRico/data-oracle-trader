import { useEffect, useState } from "react";

/**
 * Plano do usuário: free | pro.
 * HOJE: guardado em localStorage (preview/dev) — default "free".
 * FUTURO: vem de Supabase `profiles.plan` quando login + pagamento entrarem (Sprint E).
 * Trocar só a função getPlan() liga tudo no backend sem mexer no resto.
 */
export type Plan = "free" | "pro";

const LS = "oracle:plan";
const listeners = new Set<() => void>();

export function getPlan(): Plan {
  try {
    return localStorage.getItem(LS) === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}

export function setPlan(p: Plan) {
  try {
    localStorage.setItem(LS, p);
  } catch {
    /* noop */
  }
  listeners.forEach((f) => f());
}

export const isPro = () => getPlan() === "pro";

export function usePlan(): Plan {
  const [plan, setP] = useState<Plan>(getPlan);
  useEffect(() => {
    const f = () => setP(getPlan());
    listeners.add(f);
    window.addEventListener("storage", f);
    return () => {
      listeners.delete(f);
      window.removeEventListener("storage", f);
    };
  }, []);
  return plan;
}

/** Benefícios do plano Pro (mostrados no paywall). */
export const PRO_BENEFITS = [
  "Minha Carteira com leitura por IA (venda/recompra)",
  "Bots Swing Trade + Scalping",
  "Sinais de Compra e Venda + Central MTF RSI",
  "Setups Curto e Longo Prazo",
  "Alertas que disparam (em breve)",
];
