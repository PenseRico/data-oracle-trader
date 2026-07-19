import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, User as UserIcon, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Setup {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  direction: "long" | "short";
  entry_price: number;
  target_price: number;
  stop_loss: number;
  reason: string;
  created_at: string;
  profiles: { username: string | null; avatar_url: string | null };
}

export function SetupFeed() {
  const { user } = useAuth();
  const [setups, setSetups] = useState<Setup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSetups();
    
    const channel = supabase
      .channel("public-setups")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "setups" }, () => {
        fetchSetups();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchSetups() {
    try {
      const { data, error } = await supabase
        .from("setups")
        .select("*, profiles(username, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setSetups(data as unknown as Setup[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {setups.length === 0 && (
        <div className="text-center py-12 glass-card rounded-lg border-dashed border-2 border-border/30">
          <p className="text-muted-foreground text-sm">Nenhum setup compartilhado ainda. Seja o primeiro! 📈</p>
        </div>
      )}
      
      {setups.map((setup) => (
        <Card key={setup.id} className="bg-card/30 border-border/30 overflow-hidden hover:border-primary/30 transition-colors">
          <CardHeader className="p-4 pb-2 border-b border-border/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary">{setup.profiles?.username || "Trader"}</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(setup.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${setup.direction === "long" ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}`}>
                {setup.direction === "long" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {setup.direction === "long" ? "LONG" : "SHORT"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-display font-bold uppercase">{setup.coin_symbol}</span>
                <span className="text-xs text-muted-foreground">/ USD</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrada Target</div>
                <div className="text-sm font-mono font-bold">${setup.entry_price} → ${setup.target_price}</div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 italic">
              "{setup.reason}"
            </p>
            
            <div className="flex items-center justify-between pt-2 border-t border-border/10">
              <div className="text-[10px] font-mono text-destructive">SL: ${setup.stop_loss}</div>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2">
                <MessageSquare className="h-3 w-3" /> Ver análise
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
