import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Play, Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LessonPlayer } from "@/components/academy/LessonPlayer";

const mockLessons = [
  { id: "1", title: "Introdução ao Mercado de Criptomoedas", duration: "15:00", description: "Entenda o que é Bitcoin e como a tecnologia Blockchain revolucionou as finanças.", videoUrl: "youtube_l1_m1" },
  { id: "2", title: "Como ler Candles e Gráficos", duration: "25:00", description: "Fundamentos de leitura de preço e psicologia de mercado.", videoUrl: "youtube_l2_m1" },
  { id: "3", title: "Configurando sua primeira Exchange", duration: "12:00", description: "Passo a passo seguro para começar a operar.", videoUrl: "youtube_l3_m1" },
];

const modules = [
  { id: "m1", title: "Fundamentos do Mercado Cripto", lessonCount: 8, duration: "2h 30min", locked: false, description: "A base de tudo o que você precisa saber sobre o ecossistema cryptonativo." },
  { id: "m2", title: "Análise Técnica — RSI e MAs", lessonCount: 12, duration: "4h 15min", locked: false, description: "Domine os indicadores usados pelo nosso Signal Engine." },
  { id: "m3", title: "Setups de Entrada e Saída", lessonCount: 10, duration: "3h 40min", locked: true, description: "Estratégias validadas para maximize seus lucros." },
  { id: "m4", title: "Gestão de Risco", lessonCount: 6, duration: "1h 50min", locked: true, description: "Como sobreviver a longos bear markets e proteger seu capital." },
  { id: "m5", title: "On-Chain Analysis Avançado", lessonCount: 8, duration: "3h 00min", locked: true, description: "Siga o 'smart money' analisando os dados da rede." },
  { id: "m6", title: "Trading de Derivativos", lessonCount: 10, duration: "4h 00min", locked: true, description: "Como operar alavancado com responsabilidade." },
];

export default function AcademyPage() {
  const [selectedModule, setSelectedModule] = useState<any>(null);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-glow">Academy</h1>
            <p className="text-sm text-muted-foreground">O caminho para se tornar um trader de elite</p>
          </div>
          <Badge variant="outline" className="ml-auto border-primary/30 text-primary">Beta</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div 
              key={mod.id} 
              className={`glass-card rounded-lg overflow-hidden transition-all group ${mod.locked ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-primary/50 cursor-pointer shadow-hover"}`}
              onClick={() => !mod.locked && setSelectedModule(mod)}
            >
              <div className="aspect-video bg-gradient-to-br from-card to-muted/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                {mod.locked ? (
                  <Lock className="h-8 w-8 text-muted-foreground/30 relative z-10" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-background/80 shadow-glow flex items-center justify-center border border-primary/30 relative z-10 group-hover:scale-110 transition-transform">
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
                <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">{mod.title}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{mod.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 font-mono"><Play className="h-2 w-2" /> {mod.lessonCount} aulas</span>
                  <span className="flex items-center gap-1 font-mono"><BookOpen className="h-2 w-2" /> {mod.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedModule && (
        <LessonPlayer 
          moduleTitle={selectedModule.title}
          lessons={mockLessons}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </DashboardLayout>
  );
}
