/**
 * Marca "CRYPTO RICO" — caixa alta, itálico, fonte Archivo (moderna).
 * Duas cores: CRYPTO (verde da plataforma) + RICO (branco). Fonte única.
 */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: '"Archivo", sans-serif',
        fontStyle: "italic",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "-0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <span className="text-primary">Crypto</span>
      <span style={{ color: "#FFFFFF" }}>&nbsp;Rico</span>
    </span>
  );
}
