export function Logo({ escuro = false }: { escuro?: boolean }) {
  return (
    <span
      className={`text-[15px] font-extrabold tracking-[-0.01em] ${
        escuro ? "text-bg" : "text-text"
      }`}
    >
      SOL NASCENTE{" "}
      <span className={escuro ? "text-accent-400" : "text-accent"}>MOTOS</span>
    </span>
  );
}
