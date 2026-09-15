"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MicroLabel } from "@/components/ui/campos";
import { TagStatus } from "@/components/ui/TagStatus";
import { formatarDataHora, formatarWhatsapp } from "@/lib/formato";
import type { Lead } from "@/lib/leads/repositorio";
import {
  dicaDoStatus,
  labelDaTransicao,
  rotuloDoStatus,
  transicoesDe,
  type StatusLead,
} from "@/lib/leads/status";

const COLUNAS = "grid grid-cols-[1.3fr_1.1fr_1.2fr_.8fr_.9fr_.9fr] items-center";

const ROTULO_CANAL: Record<Lead["canalPreferido"], string> = {
  WhatsApp: "WhatsApp",
  Telefone: "Telefone",
  Email: "E-mail",
};

export function PainelLeads({
  leads,
  total,
  filtros,
}: {
  leads: Lead[];
  total: number;
  filtros?: React.ReactNode;
}) {
  const router = useRouter();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [statusLocal, setStatusLocal] = useState<Record<string, StatusLead>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const statusDe = (lead: Lead) => statusLocal[lead.id] ?? lead.status;
  const selecionado = leads.find((lead) => lead.id === selecionadoId) ?? null;

  async function avancar(lead: Lead, novoStatus: StatusLead) {
    const anterior = statusDe(lead);

    setSalvando(true);
    setErro(null);
    setStatusLocal((atual) => ({ ...atual, [lead.id]: novoStatus }));

    try {
      const resposta = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!resposta.ok) {
        setStatusLocal((atual) => ({ ...atual, [lead.id]: anterior }));
        setErro("Não foi possível atualizar o status deste lead.");
        return;
      }

      router.refresh();
    } catch {
      setStatusLocal((atual) => ({ ...atual, [lead.id]: anterior }));
      setErro("Não foi possível atualizar o status deste lead.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.02em]">
            Leads
          </h1>
          <p className="mt-1.5 text-[12px] text-neutral-700">
            {leads.length} de {total} · mais recentes primeiro
          </p>
        </div>

        {filtros}
      </div>

      <div className="grid flex-1 xl:grid-cols-[1fr_440px]">
        <div className="xl:border-r xl:border-neutral-300">
          {leads.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] font-bold">Nenhum lead com esses filtros</p>
              <p className="mt-2 text-[13px] text-neutral-700">
                Ajuste unidade ou status para ver outros registros.
              </p>
            </div>
          ) : (
            <>
              <div
                className={`${COLUNAS} hidden h-10 bg-surface px-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 sm:grid`}
              >
                <span>Nome</span>
                <span>WhatsApp</span>
                <span>Modelo</span>
                <span>Unidade</span>
                <span>Status</span>
                <span>Criado</span>
              </div>

              <ul>
                {leads.map((lead) => {
                  const status = statusDe(lead);
                  const ativo = lead.id === selecionadoId;

                  return (
                    <li key={lead.id}>
                      <button
                        onClick={() => setSelecionadoId(lead.id)}
                        className={`${COLUNAS} w-full border-b border-neutral-300 px-4 py-3 text-left transition-colors sm:min-h-[62px] sm:px-6 sm:py-0 ${
                          ativo
                            ? "bg-white shadow-[inset_2px_0_0_var(--color-accent)]"
                            : "hover:bg-accent-100"
                        }`}
                      >
                        <span className="text-[15px] font-bold leading-tight">
                          {lead.nome}
                        </span>
                        <span className="text-[13px]">
                          {formatarWhatsapp(lead.whatsapp)}
                        </span>
                        <span className="text-[13px]">{lead.modeloInteresse}</span>
                        <span className="text-[13px]">{lead.unidade}</span>
                        <span>
                          <TagStatus status={status} />
                        </span>
                        <span className="text-[13px] text-neutral-700">
                          {formatarDataHora(lead.createdAt)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {selecionado && (
          <Detalhe
            lead={selecionado}
            status={statusDe(selecionado)}
            erro={erro}
            salvando={salvando}
            onAvancar={(novo) => avancar(selecionado, novo)}
          />
        )}
      </div>
    </div>
  );
}

function Detalhe({
  lead,
  status,
  erro,
  salvando,
  onAvancar,
}: {
  lead: Lead;
  status: StatusLead;
  erro: string | null;
  salvando: boolean;
  onAvancar: (novo: StatusLead) => void;
}) {
  const proximos = transicoesDe(status);

  return (
    <aside className="flex flex-col gap-6 border-t border-neutral-300 bg-white p-6 sm:p-7 xl:border-t-0">
      <div className="flex flex-col gap-3">
        <MicroLabel>Lead selecionado</MicroLabel>
        <h2 className="text-[28px] font-extrabold leading-none tracking-[-0.025em] sm:text-[36px]">
          {lead.nome}
        </h2>
        <div>
          <TagStatus status={status} grande />
        </div>
      </div>

      <dl className="border-y border-neutral-300">
        {[
          // É o número que o cliente tem em mãos ao ligar — precisa ser
          // encontrável por quem atende.
          ["Protocolo", `#${lead.protocolo}`],
          ["WhatsApp", formatarWhatsapp(lead.whatsapp)],
          ["Modelo de interesse", lead.modeloInteresse],
          ["Unidade", lead.unidade],
          ["Canal preferido", ROTULO_CANAL[lead.canalPreferido]],
          ["Criado em", formatarDataHora(lead.createdAt)],
          ["Atualizado em", formatarDataHora(lead.updatedAt)],
        ].map(([rotulo, valor], indice) => (
          <div
            key={rotulo}
            className={`flex items-center justify-between gap-4 py-3.5 ${
              indice > 0 ? "border-t border-neutral-300" : ""
            }`}
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
              {rotulo}
            </dt>
            <dd className="text-[13px] font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3">
        <MicroLabel>Avançar status</MicroLabel>

        {erro && (
          <p role="alert" className="text-[13px] text-accent-700">
            {erro}
          </p>
        )}

        {proximos.map((destino, indice) => (
          <button
            key={destino}
            onClick={() => onAvancar(destino)}
            disabled={salvando}
            className={`flex h-12 w-full items-center rounded-[4px] px-[18px] text-left text-[13px] font-extrabold uppercase tracking-[0.04em] transition-colors disabled:opacity-45 ${
              destino === "Perdido" || indice > 0
                ? "border border-neutral-400 bg-white text-neutral-700 hover:bg-accent-100"
                : "bg-accent text-bg hover:bg-accent-600"
            }`}
          >
            {labelDaTransicao(destino)}
          </button>
        ))}

        <p className="text-[12px] leading-relaxed text-neutral-700">
          {dicaDoStatus(status)}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <MicroLabel>Histórico</MicroLabel>
        <ul className="border-t border-neutral-300">
          {historico(lead, status).map((evento, indice) => (
            <li
              key={indice}
              className={`flex gap-4 py-3 text-[12px] ${
                indice > 0 ? "border-t border-neutral-300" : ""
              }`}
            >
              <span className="w-24 shrink-0 text-neutral-700">{evento.quando}</span>
              <span>{evento.descricao}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/**
 * Derivado de createdAt/updatedAt — é o que o modelo atual permite saber.
 * Uma tabela de eventos daria o histórico completo (ver caminho para produção).
 */
function historico(lead: Lead, status: StatusLead) {
  const eventos = [
    {
      quando: formatarDataHora(lead.createdAt),
      descricao: "Lead criado pelo formulário público",
    },
  ];

  if (status !== "Novo") {
    eventos.push({
      quando: formatarDataHora(lead.updatedAt),
      descricao: `Status alterado para ${rotuloDoStatus(status)}`,
    });
  }

  return eventos;
}
