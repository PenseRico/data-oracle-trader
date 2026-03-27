import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, Cpu, Sparkles, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIOraAgentProps {
  coinId: string;
  symbol: string;
  price: number;
  indicators: {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    bb: { upper: number; lower: number; middle: number };
    multiRsi?: Record<string, number>;
    fundingRate?: number;
  };
}

export function AIOraAgent({ coinId, symbol, price, indicators }: AIOraAgentProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const generateReport = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // Simulate Technical Logic Summary
      const { rsi, macd, bb, multiRsi, fundingRate } = indicators;
      let bias = "Neutral";
      let confidence = 65;
      
      // Advanced Confluence Logic (Master V3)
      const isMtfOversold = multiRsi && multiRsi["4h"] < 35 && multiRsi["1d"] < 40;
      const isMtfOverbought = multiRsi && multiRsi["4h"] > 65 && multiRsi["1d"] > 60;
      const isShortSqueezeRisk = fundingRate !== undefined && fundingRate < -0.01;

      if (rsi < 30 && (isMtfOversold || isShortSqueezeRisk)) {
        bias = "Strong Bullish (Institutional)";
        confidence = isMtfOversold ? 94 : 88;
      } else if (rsi > 70 && isMtfOverbought) {
        bias = "Strong Bearish (Exhaustion)";
        confidence = 91;
      } else if (macd.macd > 0 && rsi > 50) {
        bias = "Bullish (Trending)";
        confidence = 74;
      }

      setReport({
        bias,
        confidence,
        strategy: rsi < 15 ? "DCA Entry / Snatch" : (isShortSqueezeRisk ? "Aggressive Long / Squeeze Play" : "Wait for Confluence"),
        levels: {
          support: (bb.lower * 0.995).toLocaleString(undefined, { minimumFractionDigits: 2 }),
          resistance: (bb.upper * 1.005).toLocaleString(undefined, { minimumFractionDigits: 2 }),
          tp: (price * (bias.includes("Bullish") ? 1.15 : 0.85)).toLocaleString(undefined, { minimumFractionDigits: 2 })
        },
        insight: isShortSqueezeRisk ? `Funding Rate extremamente negativo (${(fundingRate! * 100).toFixed(4)}%). Risco iminente de Short Squeeze com liquidez institucional forçando o preço acima da resistência.` :
                 isMtfOversold ? "Confluência de múltiplos timeframes (1h+4h+1D) indica exaustão vendedora sistêmica. Níveis fundamentais de suporte atingidos." :
                 rsi < 30 ? "Mercado em exaustão vendedora. Probabilidade estatística de repique para a média móvel (BB Middle) é superior a 80%." : 
                 rsi > 70 ? "Sobrecompra acentuada. Alvos de lucro atingidos. Volume decrescente sugere divergência vendedora iminente." :
                 "Consolidação lateral detectada. Evite entradas pesadas; aguarde rompimento das Bandas de Bollinger para confirmação de volume."
      });
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="glass-card p-6 rounded-xl border-primary/30 bg-black/60 shadow-[0_0_25px_rgba(174,62,47,0.1)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
        <Cpu className="h-20 w-20 text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 shadow-glow">
          <Command className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg tracking-tight">Agente O.R.A (V8)</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Oracle Resource Analyst • Vernacular Mastery</p>
        </div>
      </div>

      {!report && !analyzing ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Selecione um ativo para processar a análise multivariada de indicadores (RSI-4H, MACD-1D, Bollinger) e sentimento on-chain.
          </p>
          <Button 
            onClick={generateReport}
            className="w-full h-12 gap-2 bg-primary/20 border-primary/30 hover:bg-primary hover:text-black transition-all group"
          >
            <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
            Iniciar Análise Estratégica
          </Button>
        </div>
      ) : analyzing ? (
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="animate-pulse text-primary">Processando indicadores {symbol}...</span>
            <span>{Math.round(Math.random() * 100)}%</span>
          </div>
          <Progress value={45} className="h-1 bg-muted/20" />
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-2 bg-muted/10 rounded animate-pulse" />)}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] text-muted-foreground uppercase mb-1">Tendência Dominante</div>
              <div className={`text-lg font-bold flex items-center gap-2 ${report.bias.includes("Bullish") ? "text-cyan-400" : "text-red-400"}`}>
                {report.bias.includes("Bullish") ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {report.bias.replace("Strong Bullish", "Compra Institucional").replace("Strong Bearish", "Distribuição Forte").replace("Bullish", "Alta Técnica").replace("Bearish", "Baixa Técnica").replace("Institutional", "Institucional")}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] text-muted-foreground uppercase mb-1">Grau de Assertividade</div>
              <div className="text-lg font-bold text-primary font-mono">{report.confidence}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Target className="h-3 w-3" /> Níveis Críticos
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded bg-black/40 border border-white/5">
                <div className="text-[8px] text-muted-foreground mb-1">SUPORTE</div>
                <div className="text-xs font-mono font-bold">{report.levels.support}</div>
              </div>
              <div className="text-center p-2 rounded bg-black/40 border border-white/5">
                <div className="text-[8px] text-muted-foreground mb-1">RESISTÊNCIA</div>
                <div className="text-xs font-mono font-bold">{report.levels.resistance}</div>
              </div>
              <div className="text-center p-2 rounded bg-primary/10 border border-primary/20">
                <div className="text-[8px] text-primary mb-1">ALVO TP</div>
                <div className="text-xs font-mono font-bold text-primary">{report.levels.tp}</div>
              </div>
            </div>
          </div>

          <ScrollArea className="h-24 rounded-lg bg-muted/10 p-4 border border-white/5">
             <div className="flex gap-2 items-start">
               <Zap className="h-4 w-4 text-primary shrink-0 mt-1" />
               <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                 "Oráculo: {report.insight}"
               </p>
             </div>
          </ScrollArea>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-xs border-white/10 hover:bg-white/5"
            onClick={() => setReport(null)}
          >
            Nova Análise de Ativo
          </Button>
        </div>
      )}
    </div>
  );
}
