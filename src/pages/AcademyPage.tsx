import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Play, Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const modules = [
  { title: "Fundamentos do Mercado Cripto", lessons: 8, duration: "2h 30min", locked: false },
  { title: "Análise Técnica — RSI e MAs", lessons: 12, duration: "4h 15min", locked: false },
  { title: "Setups de Entrada e Saída", lessons: 10, duration: "3h 40min", locked: true },
  { title: "Gestão de Risco", lessons: 6, duration: "1h 50min", locked: true },
  { title: "On-Chain Analysis Avançado", lessons: 8, duration: "3h 00min", locked: true },
  { title: "Trading de Derivativos", lessons: 10, duration: "4h 00min", locked: true },
];

export default function AcademyPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Academy</h1>
            <p className="text-sm text-muted-foreground">Módulos de aulas estilo Netflix — exclusivo para alunos</p>
          </div>
          <Badge variant="outline" className="ml-auto border-primary/30 text-primary">Em breve</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => (
            <div key={i} className={`glass-card rounded-lg overflow-hidden transition-all ${mod.locked ? "opacity-60" : "hover:border-primary/30"}`}>
              <div className="aspect-video bg-gradient-to-br from-card to-muted/30 flex items-center justify-center relative">
                {mod.locked ? (
                  <Lock className="h-8 w-8 text-muted-foreground/30" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Play className="h-5 w-5 text-primary ml-0.5" />
                  </div>
                )}
                {mod.locked && (
                  <Badge className="absolute top-3 right-3 bg-muted/80 text-muted-foreground text-[10px]">
                    <Lock className="h-2.5 w-2.5 mr-1" /> Exclusivo
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-display font-semibold text-sm">{mod.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{mod.lessons} aulas</span>
                  <span>·</span>
                  <span>{mod.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
