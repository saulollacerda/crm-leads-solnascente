import Link from "next/link";
import { formatarMoeda } from "@/lib/formato";
import type { Modelo } from "@/lib/modelos/catalogo";

export function OutrosModelos({
  modelos,
  className = "",
}: {
  modelos: readonly Modelo[];
  className?: string;
}) {
  return (
    <section
      aria-labelledby="outros-modelos"
      className={`flex flex-col gap-3 px-4 py-6 sm:px-10 sm:pb-10 ${className}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="outros-modelos"
          className="text-[11px] font-semibold uppercase tracking-[0.1em]"
        >
          Outros modelos
        </h2>
        <p className="text-[11px] text-neutral-700">
          Clique para trocar a moto e o formulário
        </p>
      </div>

      <ul className="grid border-t border-text sm:grid-cols-3 sm:border-b sm:border-text">
        {modelos.map((modelo) => (
          <li
            key={modelo.slug}
            className="border-b border-neutral-300 sm:border-b-0 sm:border-l sm:border-neutral-300 sm:first:border-l-0"
          >
            <Link
              href={`/modelos/${modelo.slug}`}
              className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-accent-100 sm:h-full sm:flex-col sm:items-start sm:justify-between sm:gap-3 sm:px-5 sm:py-[18px]"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold leading-tight">
                  {modelo.nome}
                </span>
                <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-700">
                  {modelo.categoria}
                </span>
              </span>
              <span className="text-[15px] font-extrabold">
                {formatarMoeda(modelo.preco)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
