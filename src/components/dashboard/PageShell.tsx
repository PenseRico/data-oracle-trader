import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface PageShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "destructive" | "emerald" | "amber" | "violet";
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Constrain content width. Defaults to 1600. */
  maxWidth?: number | "full";
}

const ACCENT_CLASS: Record<NonNullable<PageShellProps["accent"]>, { text: string; bg: string; border: string }> = {
  primary: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  destructive: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  violet: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
};

export function PageShell({
  title,
  subtitle,
  icon: Icon,
  accent = "primary",
  breadcrumb,
  actions,
  children,
  maxWidth = 1600,
}: PageShellProps) {
  const tone = ACCENT_CLASS[accent];
  const widthStyle =
    maxWidth === "full"
      ? "w-full"
      : "w-full mx-auto";
  const widthInline = maxWidth === "full" ? undefined : { maxWidth };

  return (
    <div className={`${widthStyle} pb-12 animate-fade-up`} style={widthInline}>
      <div className="px-1 md:px-2">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 font-mono mb-3">
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {item.href ? (
                  <Link to={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={idx === breadcrumb.length - 1 ? tone.text : ""}>{item.label}</span>
                )}
                {idx < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3 opacity-50" />}
              </span>
            ))}
          </nav>
        )}

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-5 mb-6">
          <div className="flex items-start gap-4 min-w-0">
            {Icon && (
              <div className={`h-11 w-11 rounded-xl ${tone.bg} border ${tone.border} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${tone.text}`} />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white leading-none">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground/80 uppercase tracking-[0.18em] font-mono">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {actions}
            </div>
          )}
        </header>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
