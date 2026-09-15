"use client";

import Link, { useLinkStatus } from "next/link";

/**
 * Filtrar é uma ida ao servidor: sem sinal nenhum, o clique parece não ter
 * funcionado até a lista trocar. `useLinkStatus` só funciona dentro do
 * `<Link>`, daí o componente separado para o indicador.
 */
function Indicador() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span
      aria-hidden
      className="ml-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60"
    />
  );
}

export function LinkFiltro({
  href,
  ativo,
  primeiro,
  children,
}: {
  href: string;
  ativo: boolean;
  primeiro: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "true" : undefined}
      className={`flex items-center px-3 text-[12px] font-semibold transition-colors ${
        primeiro ? "" : "border-l border-neutral-300"
      } ${ativo ? "bg-text text-bg" : "bg-white hover:bg-accent-100"}`}
    >
      {children}
      <Indicador />
    </Link>
  );
}
