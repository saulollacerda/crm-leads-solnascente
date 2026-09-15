/**
 * Componente puro: quem resolve o arquivo é o servidor, via `logoOficial()`.
 * Assim a logo também funciona dentro de client components, que não podem
 * tocar no sistema de arquivos.
 *
 * Sem `src`, vale a logo tipográfica do design.
 * `escuro` é para a barra do admin, onde o fundo é `#201e1d`.
 */
export function Logo({
  src,
  escuro = false,
}: {
  src?: string | null;
  escuro?: boolean;
}) {
  if (src) {
    return (
      // <img> em vez de next/image: a altura é fixa e a largura livre, então
      // não há dimensões intrínsecas a declarar — e logo costuma ser SVG, que
      // o otimizador repassa intacto de qualquer forma.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="Sol Nascente Motos" className="h-7 w-auto sm:h-8" />
    );
  }

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
