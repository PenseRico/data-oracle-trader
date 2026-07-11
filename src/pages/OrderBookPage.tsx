import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageShell } from "@/components/dashboard/PageShell";
import { CoinglassWhaleBoard } from "@/components/dashboard/CoinglassWhaleBoard";
import { LayoutList, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OrderBookPage() {
  return (
    <DashboardLayout>
      <PageShell
        title={<>Livro de <span className="text-primary">Ordens</span></>}
        subtitle="Whale tracker · grandes ordens em tempo real · estilo Coinglass"
        icon={LayoutList}
        accent="primary"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Livro de Ordens" },
        ]}
        actions={
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/30 text-primary text-[9px] uppercase tracking-widest gap-1.5"
          >
            <Zap className="h-3 w-3 fill-primary" />
            Order Flow Live
          </Badge>
        }
      >
        <CoinglassWhaleBoard />
      </PageShell>
    </DashboardLayout>
  );
}
