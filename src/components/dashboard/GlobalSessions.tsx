import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Panel } from "./MarketOverviewTerminal";

/**
 * Sessões de mercado global (forex/bolsas) em horário de Brasília (BRT, UTC-3).
 * Timeline 0–23h com barra por sessão e marcador da hora atual.
 * Horários aproximados — o objetivo é leitura de sobreposição (overlap = mais volume).
 */
const SESSIONS = [
  { name: "Sydney", start: 17, end: 2, color: "#ec4899" },
  { name: "Tóquio", start: 21, end: 6, color: "#a855f7" },
  { name: "Londres", start: 5, end: 14, color: "#eab308" },
  { name: "Nova York", start: 10, end: 19, color: "#3b82f6" },
];

function segs(start: number, end: number): [number, number][] {
  return start < end ? [[start, end]] : [[start, 24], [0, end]];
}

function isOpen(start: number, end: number, hour: number) {
  return segs(start, end).some(([s, e]) => hour >= s && hour < e);
}

function useBrtNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10) % 24;
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return { hour, minute, frac: hour + minute / 60 };
}

export function GlobalSessions({ time }: { time: string }) {
  const { hour, frac } = useBrtNow();
  const nowLeft = `${(frac / 24) * 100}%`;
  const openNow = SESSIONS.filter((s) => isOpen(s.start, s.end, hour));

  return (
    <Panel title="Sessões Globais" icon={Clock} time={time} className="h-full" hintId="sessions">
      <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
        Aberto agora:{" "}
        {openNow.length ? (
          openNow.map((s) => (
            <span key={s.name} className="text-white font-bold" style={{ color: s.color }}>
              {s.name}{" "}
            </span>
          ))
        ) : (
          <span className="text-muted-foreground/40">mercado calmo</span>
        )}
      </div>

      <div className="space-y-2">
        {SESSIONS.map((s) => (
          <div key={s.name} className="grid grid-cols-[64px_1fr] items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/70 truncate">{s.name}</span>
            <div className="relative h-4 rounded bg-white/[0.03] overflow-hidden">
              {segs(s.start, s.end).map(([a, b], i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 rounded opacity-80"
                  style={{ left: `${(a / 24) * 100}%`, width: `${((b - a) / 24) * 100}%`, background: s.color }}
                />
              ))}
              {/* marcador hora atual */}
              <div className="absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)] z-10" style={{ left: nowLeft }} />
            </div>
          </div>
        ))}

        {/* eixo de horas */}
        <div className="grid grid-cols-[64px_1fr] gap-2 pt-1">
          <span />
          <div className="relative h-3">
            {[0, 4, 8, 12, 16, 20, 24].map((h) => (
              <span key={h} className="absolute text-[8px] font-mono text-muted-foreground/40 -translate-x-1/2" style={{ left: `${(h / 24) * 100}%` }}>
                {h}h
              </span>
            ))}
            <div className="absolute -top-1 bottom-0 w-px bg-white/90 z-10" style={{ left: nowLeft }} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[9px] text-muted-foreground/50 font-mono leading-relaxed border-t border-white/5 pt-2">
        Sobreposição de sessões = mais traders ativos = movimento mais forte. Horários aprox. em BRT.
      </p>
    </Panel>
  );
}
