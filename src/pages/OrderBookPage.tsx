import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WhaleOrderTable } from "@/components/dashboard/WhaleOrderTable";
import { LayoutList, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OrderBookPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-up">
        {/* Header Cockpit */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 glass-card border-primary/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                <LayoutList className="h-3.5 w-3.5 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight uppercase italic">
                Livro de Ordens <span className="text-primary NOT-ITALIC">(Mestre Whales)</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-[11px] uppercase tracking-widest font-mono">
              Monitoramento institucional de grandes clusters e paredes de liquidez transversal.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono">Exchange Dominance</span>
              <span className="text-sm font-display font-bold text-foreground">Binance Futures</span>
            </div>
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary gap-1.5 py-1 px-3 animate-pulse">
              <Zap className="h-3 w-3 fill-primary" />
              Real-Time Order Flow
            </Badge>
          </div>
        </header>

        {/* Technical Whale Monitor */}
        <div className="glass-card p-6 border-white/[0.04]">
          <WhaleOrderTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
