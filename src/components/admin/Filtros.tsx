import Link from "next/link";
import { MicroLabel } from "@/components/ui/campos";
import { STATUS_LEAD, rotuloDoStatus } from "@/lib/leads/status";
import { UNIDADES } from "@/lib/leads/schema";

export type FiltrosAtivos = { unidade?: string; status?: string };

function href(filtros: FiltrosAtivos, chave: keyof FiltrosAtivos, valor?: string) {
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries({ ...filtros, [chave]: valor })) {
    if (v) params.set(k, v);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

function Grupo({
  rotulo,
  opcoes,
  chave,
  filtros,
}: {
  rotulo: string;
  opcoes: { valor?: string; texto: string }[];
  chave: keyof FiltrosAtivos;
  filtros: FiltrosAtivos;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <MicroLabel>{rotulo}</MicroLabel>
      <div className="flex h-[34px] overflow-hidden rounded-[4px] border border-neutral-300">
        {opcoes.map((opcao, indice) => {
          const ativo = (filtros[chave] ?? undefined) === opcao.valor;

          return (
            <Link
              key={opcao.texto}
              href={href(filtros, chave, opcao.valor)}
              aria-current={ativo ? "true" : undefined}
              className={`flex items-center px-3 text-[12px] font-semibold transition-colors ${
                indice > 0 ? "border-l border-neutral-300" : ""
              } ${ativo ? "bg-text text-bg" : "bg-white hover:bg-accent-100"}`}
            >
              {opcao.texto}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Filtros({ filtros }: { filtros: FiltrosAtivos }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Grupo
        rotulo="Unidade"
        chave="unidade"
        filtros={filtros}
        opcoes={[
          { texto: "Todas" },
          ...UNIDADES.map((u) => ({ valor: u, texto: u })),
        ]}
      />
      <Grupo
        rotulo="Status"
        chave="status"
        filtros={filtros}
        opcoes={[
          { texto: "Todos" },
          ...STATUS_LEAD.map((s) => ({ valor: s, texto: rotuloDoStatus(s) })),
        ]}
      />
    </div>
  );
}
