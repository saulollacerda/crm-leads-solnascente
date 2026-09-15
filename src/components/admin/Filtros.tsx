import { MicroLabel } from "@/components/ui/campos";
import { LinkFiltro } from "./LinkFiltro";
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
        {opcoes.map((opcao, indice) => (
          <LinkFiltro
            key={opcao.texto}
            href={href(filtros, chave, opcao.valor)}
            ativo={(filtros[chave] ?? undefined) === opcao.valor}
            primeiro={indice === 0}
          >
            {opcao.texto}
          </LinkFiltro>
        ))}
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
