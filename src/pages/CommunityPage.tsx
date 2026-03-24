import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Send, Image, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Comunidade</h1>
            <p className="text-sm text-muted-foreground">Chat em tempo real — compartilhe análises, fotos e ideias</p>
          </div>
          <Badge variant="outline" className="ml-auto border-primary/30 text-primary">Em breve</Badge>
        </div>

        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Sala Geral</span>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>— membros online</span>
            </div>
          </div>

          <div className="h-[500px] flex flex-col">
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-primary/50" />
                </div>
                <h3 className="font-display font-semibold text-lg">Chat da Comunidade</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Em breve: chat estilo Discord/Telegram com salas por tópico (BTC, ETH, Altcoins, Análises Técnicas).
                  Compartilhe textos, imagens e setups com a comunidade.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["#geral", "#bitcoin", "#altcoins", "#análises", "#setups"].map((ch) => (
                    <Badge key={ch} variant="outline" className="border-border/50 text-muted-foreground">{ch}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 p-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled className="shrink-0">
                <Image className="h-4 w-4" />
              </Button>
              <div className="flex-1 h-9 rounded-lg bg-muted/30 border border-border/30 px-3 flex items-center text-xs text-muted-foreground/50">
                Digite uma mensagem...
              </div>
              <Button variant="ghost" size="icon" disabled className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
