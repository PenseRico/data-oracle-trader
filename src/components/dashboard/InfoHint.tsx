import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GLOSSARY } from "@/lib/indicatorGlossary";

interface InfoHintProps {
  /** Chave do glossário central (preferido). */
  id?: keyof typeof GLOSSARY | string;
  /** Override manual (quando não está no glossário). */
  term?: string;
  what?: string;
  how?: string;
  /** Tamanho do ícone em px. */
  size?: number;
  className?: string;
}

/**
 * Ícone "?" que abre uma explicação curta e fácil do indicador.
 * Use <InfoHint id="rsi" /> ou passe term/what/how manualmente.
 */
export function InfoHint({ id, term, what, how, size = 12, className = "" }: InfoHintProps) {
  const entry = id ? GLOSSARY[id as string] : undefined;
  const t = term ?? entry?.term;
  const w = what ?? entry?.what;
  const h = how ?? entry?.how;
  if (!w) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={`O que é ${t ?? "este indicador"}?`}
          className={`inline-flex items-center justify-center text-muted-foreground/40 hover:text-primary transition-colors shrink-0 ${className}`}
        >
          <HelpCircle style={{ width: size, height: size }} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onClick={(e) => e.stopPropagation()}
        className="w-72 border-primary/20 bg-zinc-950/95 backdrop-blur-xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]"
      >
        {t && (
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">{t}</span>
          </div>
        )}
        <p className="text-[11px] text-foreground/90 leading-relaxed">{w}</p>
        {h && (
          <p className="mt-2 pt-2 border-t border-white/5 text-[11px] text-muted-foreground/80 leading-relaxed">
            <span className="font-bold text-emerald-300/90 uppercase tracking-wider text-[9px] mr-1">Como usar:</span>
            {h}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
