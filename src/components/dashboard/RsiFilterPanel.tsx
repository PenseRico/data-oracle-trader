import { useState } from "react";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeFrame } from "@/data/mockCoins";

interface RsiFilterPanelProps {
  onFilter: (config: { timeframe: TimeFrame; min: number; max: number }) => void;
  activeTimeframe: TimeFrame;
}

export function RsiFilterPanel({ onFilter, activeTimeframe }: RsiFilterPanelProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>(activeTimeframe);
  const [range, setRange] = useState([0, 100]);

  const presets = [
    { label: 'Sobrevendido (<30)', min: 0, max: 30, icon: TrendingUp, color: 'text-primary' },
    { label: 'Neutro (30-70)', min: 30, max: 70, icon: Activity, color: 'text-muted-foreground' },
    { label: 'Sobrecomprado (>70)', min: 70, max: 100, icon: TrendingDown, color: 'text-destructive' },
  ];

  return (
    <div className="glass-card rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Filtro RSI</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Timeframe:</span>
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as TimeFrame)}>
            <SelectTrigger className="w-20 h-7 text-xs bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4h">4H</SelectItem>
              <SelectItem value="12h">12H</SelectItem>
              <SelectItem value="24h">24H</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>RSI: {range[0]}</span>
            <span>{range[1]}</span>
          </div>
          <Slider
            value={range}
            onValueChange={setRange}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setRange([preset.min, preset.max]);
                onFilter({ timeframe, min: preset.min, max: preset.max });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-secondary/50 transition-colors text-left"
            >
              <preset.icon className={`h-3.5 w-3.5 ${preset.color}`} />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => onFilter({ timeframe, min: range[0], max: range[1] })}
        >
          Aplicar Filtro
        </Button>
      </div>
    </div>
  );
}
