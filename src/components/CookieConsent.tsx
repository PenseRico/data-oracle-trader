import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "oracle:cookie-consent";

type Consent = "accepted" | "essential";

function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "essential") return v;
  } catch {
    // localStorage indisponível (modo privado / bloqueado) — segue sem persistência
  }
  return null;
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignora falha de escrita
  }
}

export function CookieConsent() {
  const [hidden, setHidden] = useState<boolean>(() => readConsent() !== null);

  if (hidden) return null;

  const choose = (value: Consent) => {
    writeConsent(value);
    setHidden(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto glass-card rounded-xl border border-white/10 bg-black/80 backdrop-blur shadow-glow p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Cookie className="h-4 w-4 text-primary" />
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Usamos cookies essenciais para login e preferências, sem rastreamento de anúncios. Saiba mais na{" "}
            <Link to="/privacidade" className="text-primary hover:underline font-bold">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-lg border border-white/10 bg-white/5 text-white/80 text-xs font-bold px-3 py-1.5 hover:bg-white/10 transition-colors"
          >
            Só essenciais
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-lg bg-primary/20 border border-primary/40 text-primary text-xs font-bold px-4 py-1.5 hover:bg-primary/30 transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
