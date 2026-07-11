import { useNavigate } from "react-router-dom";
import { usePlan, PRO_BENEFITS } from "@/lib/plan";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Lock, Sparkles, Check, Crown } from "lucide-react";

/** Envolve páginas PRO. Se o usuário não é Pro, mostra o paywall no lugar do conteúdo. */
export function ProGate({ children, feature }: { children: React.ReactNode; feature?: string }) {
  const plan = usePlan();
  if (plan === "pro") return <>{children}</>;
  return <Paywall feature={feature} />;
}

function Paywall({ feature }: { feature?: string }) {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
        <div className="glass-card rounded-2xl border-primary/30 bg-black/60 p-8 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 opacity-10">
            <Crown className="h-56 w-56 text-primary" />
          </div>
          <div className="relative z-10 space-y-5">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Recurso Pro</div>
              <h1 className="font-display font-black text-2xl text-white tracking-tight">
                {feature ?? "Este recurso"} é exclusivo do plano Pro
              </h1>
              <p className="text-[12px] text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
                As análises de mercado continuam grátis. Carteira, IA, bots e sinais de compra/venda
                ficam no Pro — onde a plataforma vira sua mesa de operações.
              </p>
            </div>

            <ul className="text-left space-y-2 max-w-sm mx-auto">
              {PRO_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[12px] text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/#planos")}
                className="flex items-center gap-2 rounded-lg bg-primary text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                <Sparkles className="h-4 w-4" /> Assinar Pro
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-[11px] font-mono text-muted-foreground/60 hover:text-white transition-colors"
              >
                voltar ao painel gratuito
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/40 font-mono pt-2">
              Assinatura e pagamento entram na Sprint E · gating já ativo
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
