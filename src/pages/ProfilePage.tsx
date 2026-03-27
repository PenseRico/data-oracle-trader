import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Bell, LayoutGrid, Zap, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ alerts: 0, setups: 0, rank: "Bronze" });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    const { count: alertsCount } = await supabase.from("alerts").select("*", { count: "exact", head: true });
    const { count: setupsCount } = await supabase.from("setups").select("*", { count: "exact", head: true });
    
    setStats({
      alerts: alertsCount || 0,
      setups: setupsCount || 0,
      rank: (setupsCount || 0) > 10 ? "Gold" : (setupsCount || 0) > 5 ? "Silver" : "Bronze"
    });
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* Profile Header */}
        <div className="glass-card rounded-2xl p-8 border border-border/30 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserIcon className="h-32 w-32" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-primary/20 flex items-center justify-center text-4xl font-bold text-primary shadow-glow">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="font-display font-bold text-3xl text-glow">{user?.user_metadata?.username || "Trader Elite"}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                  Rank {stats.rank}
                </Badge>
                <Badge variant="outline" className="bg-muted/50 border-border/50 text-muted-foreground">
                  Joined {new Date(user?.created_at || "").toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={<Bell className="h-4 w-4 text-primary" />} label="Alertas Ativos" value={stats.alerts} />
          <StatCard icon={<TrendingUp className="h-4 w-4 text-primary" />} label="Setups Compartilhados" value={stats.setups} />
          <StatCard icon={<Zap className="h-4 w-4 text-primary" />} label="Sinal de Precisão" value="84%" />
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="bg-muted/20 border-border/30">
            <TabsTrigger value="alerts">Meus Alertas</TabsTrigger>
            <TabsTrigger value="setups">Meus Setups</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts">
            <Card className="bg-card/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground">Alertas Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground text-center py-8">
                  Você tem {stats.alerts} alertas configurados no momento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="setups">
            <div className="text-center py-20 glass-card rounded-lg border-2 border-dashed border-border/30">
              <LayoutGrid className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Nenhum setup publicado ainda.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass-card rounded-xl p-4 border border-border/30 bg-muted/5 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-display font-bold text-glow">{value}</div>
    </div>
  );
}
