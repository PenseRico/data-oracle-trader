import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Plus, Bell, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Alert {
  id: string;
  coin: string;
  rule_type: string;
  rule_value: number;
  direction: string;
  signal_type: string;
  is_active: boolean;
  created_at: string;
}

const ruleLabels: Record<string, string> = {
  score: "Score",
  rsi: "RSI",
  price_change_24h: "Variação 24h (%)",
  volume_ratio: "Volume/MCap (%)",
};

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ coin: "any", rule_type: "score", rule_value: "8", direction: "above", signal_type: "buy" });

  useEffect(() => { if (user) fetchAlerts(); }, [user]);

  async function fetchAlerts() {
    const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
    if (data) setAlerts(data as Alert[]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      coin: form.coin,
      rule_type: form.rule_type,
      rule_value: parseFloat(form.rule_value),
      direction: form.direction,
      signal_type: form.signal_type,
    });
    if (error) { toast.error("Erro ao criar alerta"); return; }
    toast.success("Alerta criado!");
    setOpen(false);
    fetchAlerts();
  }

  async function toggleAlert(id: string, current: boolean) {
    await supabase.from("alerts").update({ is_active: !current }).eq("id", id);
    fetchAlerts();
  }

  async function deleteAlert(id: string) {
    await supabase.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alerta removido");
  }

  function getRuleDisplay(a: Alert) {
    const label = ruleLabels[a.rule_type] || a.rule_type;
    const dir = a.direction === "above" ? "≥" : "≤";
    return `${label} ${dir} ${a.rule_value}`;
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Alertas Inteligentes</h1>
            <p className="text-sm text-muted-foreground">Configure regras personalizadas</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto gap-2"><Plus className="h-3 w-3" />Novo Alerta</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="font-display">Criar Alerta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Moeda</label>
                  <Input value={form.coin} onChange={(e) => setForm({ ...form, coin: e.target.value })} placeholder="any = qualquer moeda" className="bg-muted/30 border-border/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Indicador</label>
                    <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="rsi">RSI</SelectItem>
                        <SelectItem value="price_change_24h">Variação 24h</SelectItem>
                        <SelectItem value="volume_ratio">Volume/MCap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Direção</label>
                    <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Acima ou igual (≥)</SelectItem>
                        <SelectItem value="below">Abaixo ou igual (≤)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Valor</label>
                    <Input type="number" value={form.rule_value} onChange={(e) => setForm({ ...form, rule_value: e.target.value })} className="bg-muted/30 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Tipo de Sinal</label>
                    <Select value={form.signal_type} onValueChange={(v) => setForm({ ...form, signal_type: v })}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Compra</SelectItem>
                        <SelectItem value="sell">Venda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Criar Alerta</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="glass-card rounded-lg p-6 space-y-3">
          <h3 className="font-display font-semibold text-sm text-muted-foreground">Seus Alertas ({alerts.length})</h3>
          {alerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum alerta configurado. Crie seu primeiro alerta! 🔔
            </div>
          )}
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className={`h-2 w-2 rounded-full shrink-0 ${alert.is_active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
              <Badge variant="outline" className="text-[10px] border-border/50 uppercase">{alert.coin}</Badge>
              <span className="text-xs flex-1 font-mono">{getRuleDisplay(alert)}</span>
              <Badge variant="outline" className={`text-[10px] ${alert.signal_type === "buy" ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}`}>
                {alert.signal_type === "buy" ? "COMPRA" : "VENDA"}
              </Badge>
              <button onClick={() => toggleAlert(alert.id, alert.is_active)} className="p-1 hover:bg-primary/10 rounded">
                <Power className={`h-3.5 w-3.5 ${alert.is_active ? "text-primary" : "text-muted-foreground"}`} />
              </button>
              <button onClick={() => deleteAlert(alert.id)} className="p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
