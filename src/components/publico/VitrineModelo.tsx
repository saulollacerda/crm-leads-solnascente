import { formatarMoeda } from "@/lib/formato";
import type { ModeloComFoto } from "@/lib/modelos/fotos";
import { FotoModelo } from "./FotoModelo";

export function VitrineModelo({
  modelo,
  className = "",
}: {
  modelo: ModeloComFoto;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 px-4 py-6 sm:px-10 sm:pt-10 ${className}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
          Honda · {modelo.categoria}
        </p>
        <h1 className="mt-2 text-[34px] font-extrabold leading-none tracking-[-0.03em] sm:text-[64px] sm:leading-[0.96]">
          {modelo.nome}
        </h1>
      </div>

      <FotoModelo modelo={modelo} altura="h-[210px] sm:h-[340px]" />

      <dl className="grid grid-cols-2 border-y border-regua sm:grid-cols-3">
        <Especificacao rotulo="Valor à vista" rotuloMobile="À vista">
          {formatarMoeda(modelo.preco)}
        </Especificacao>
        <Especificacao
          rotulo="Parcela 48×"
          rotuloMobile="48×"
          className="border-l border-neutral-300"
        >
          {formatarMoeda(modelo.parcela48x)}
        </Especificacao>
        <Especificacao
          rotulo="Motor"
          rotuloMobile="Motor"
          className="col-span-2 border-t border-neutral-300 sm:col-span-1 sm:border-l sm:border-t-0"
        >
          {modelo.motor}
        </Especificacao>
      </dl>
    </div>
  );
}

function Especificacao({
  rotulo,
  rotuloMobile,
  children,
  className = "",
}: {
  rotulo: string;
  rotuloMobile: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-[18px] sm:px-5 ${className}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
        <span className="sm:hidden">{rotuloMobile}</span>
        <span className="hidden sm:inline">{rotulo}</span>
      </dt>
      <dd className="mt-1.5 text-lg font-extrabold leading-none tracking-[-0.02em] sm:text-[26px]">
        {children}
      </dd>
    </div>
  );
}
