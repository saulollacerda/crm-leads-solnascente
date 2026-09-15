import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BarraSuperior } from "@/components/admin/BarraSuperior";
import { Filtros } from "@/components/admin/Filtros";
import { MenuLateral } from "@/components/admin/MenuLateral";
import { PainelLeads } from "@/components/admin/PainelLeads";
import { COOKIE_SESSAO, verificarSessao } from "@/lib/auth/sessao";
import { logoOficial } from "@/lib/marca";
import { contarLeads, listarLeads } from "@/lib/leads/repositorio";
import { UNIDADES, type Unidade } from "@/lib/leads/schema";
import { ehStatusLead, type StatusLead } from "@/lib/leads/status";

export const metadata: Metadata = {
  title: "Leads — Painel Sol Nascente",
};

export default async function PaginaPainel({
  searchParams,
}: {
  searchParams: Promise<{ unidade?: string; status?: string }>;
}) {
  const { unidade, status } = await searchParams;

  const filtroUnidade = UNIDADES.includes(unidade as Unidade)
    ? (unidade as Unidade)
    : undefined;
  const filtroStatus = ehStatusLead(status) ? (status as StatusLead) : undefined;

  // O painel lê o repositório direto: não faz sentido a página chamar a
  // própria API por HTTP para buscar o que já pode ler do banco.
  const [leads, total, sessao] = await Promise.all([
    listarLeads({ unidade: filtroUnidade, status: filtroStatus }),
    contarLeads(),
    verificarSessao((await cookies()).get(COOKIE_SESSAO)?.value ?? ""),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <BarraSuperior usuario={sessao?.usuario ?? "admin"} logo={logoOficial(true)} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <MenuLateral quantidadeDeLeads={total} />

        <PainelLeads
          leads={leads}
          total={total}
          filtros={
            <Filtros filtros={{ unidade: filtroUnidade, status: filtroStatus }} />
          }
        />
      </div>
    </div>
  );
}
