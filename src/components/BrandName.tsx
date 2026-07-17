/**
 * Marca "Crypto Rico" com duas cores: Crypto (verde da plataforma) + Rico (branco).
 * Fonte única — muda aqui e reflete em todo lugar.
 */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={className} style={{ whiteSpace: "nowrap" }}>
      <span className="text-primary">Crypto</span>
      <span style={{ color: "#FFFFFF" }}>&nbsp;Rico</span>
    </span>
  );
}
