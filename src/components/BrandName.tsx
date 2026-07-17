/**
 * Marca "Crypto Rico" com duas cores: Crypto (verde da marca) + Rico (dourado).
 * Fonte única — muda aqui e reflete em todo lugar.
 */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={className} style={{ whiteSpace: "nowrap" }}>
      <span style={{ color: "#10B981" }}>Crypto</span>
      <span style={{ color: "#F5B301" }}>&nbsp;Rico</span>
    </span>
  );
}
