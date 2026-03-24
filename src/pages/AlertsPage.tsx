import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Zap, Plus, Bell, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const exampleAlerts = [
  { coin: "BTC", rule: "Score ≥ 8", status: "ativo", type: "compra" },
  { coin: "ETH", rule: "RSI < 25 + Volume alto", status: "ativo", type: "compra" },
  { coin: "SOL", rule: "RSI > 75", status: "ativo", type: "venda" },
  { coin: "Qualquer", rule: "Score ≤ 0", status: "pausado", type: "venda" },
];

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Alertas Inteligentes</h1>
            <p className="text-sm text-muted-foreground">Configure regras personalizadas estilo TradingView</p>
          </div>
          <Badge variant="outline" className="ml-auto border-primary/30 text-primary">Em breve</Badge>
        </div>

        <div className="glass-card rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm">Seus Alertas</h3>
            <Button size="sm" disabled className="gap-2">
              <Plus className="h-3 w-3" />
              Novo Alerta
            </Button>
          </div>

          <div className="space-y-2">
            {exampleAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className={`h-2 w-2 rounded-full ${alert.status === "ativo" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                <Badge variant="outline" className="text-[10px] border-border/50">{alert.coin}</Badge>
                <span className="text-xs flex-1">{alert.rule}</span>
                <Badge variant="outline" className={`text-[10px] ${alert.type === "compra" ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}`}>
                  {alert.type.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1">
                  <Bell className="h-3 w-3 text-muted-foreground/50" />
                  <Volume2 className="h-3 w-3 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-lg p-8 text-center space-y-3">
          <h3 className="font-display font-semibold">Sistema de Alertas Avançado</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Em breve: crie regras como "Se Score ≥ 8 → ALERTA COMPRA" ou "Se RSI &lt; 25 + Volume alto → ALERTA".
            Receba notificações push, sons e highlights no dashboard.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
