import { prisma } from "@/lib/prisma";
import { podeTransicionar, type StatusLead } from "./status";
import type { CanalContato, NovoLead, Unidade } from "./schema";

export const VERSAO_CONSENTIMENTO = "2026-09-15";

export type Lead = {
  id: string;
  /** Gerado pela sequência do banco na criação (ver migration). */
  protocolo: string;
  nome: string;
  whatsapp: string;
  modeloInteresse: string;
  unidade: Unidade;
  canalPreferido: CanalContato;
  status: StatusLead;
  createdAt: Date;
  updatedAt: Date;
};

export class TransicaoInvalida extends Error {
  constructor(
    readonly de: StatusLead,
    readonly para: StatusLead,
  ) {
    super(`Transição inválida: ${de} → ${para}.`);
    this.name = "TransicaoInvalida";
  }
}

export class LeadNaoEncontrado extends Error {
  constructor(readonly id: string) {
    super(`Lead ${id} não encontrado.`);
    this.name = "LeadNaoEncontrado";
  }
}

/** O status não é parametrizável aqui: quem define é o default do banco (ADR-006). */
export async function criarLead(dados: NovoLead): Promise<Lead> {
  return prisma.lead.create({
    data: {
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      modeloInteresse: dados.modeloInteresse,
      unidade: dados.unidade,
      canalPreferido: dados.canalPreferido,
      consentimentoEm: new Date(),
      consentimentoVersao: VERSAO_CONSENTIMENTO,
    },
  });
}

export async function listarLeads(
  filtros: { unidade?: Unidade; status?: StatusLead } = {},
): Promise<Lead[]> {
  return prisma.lead.findMany({
    where: {
      unidade: filtros.unidade,
      status: filtros.status,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function buscarLead(id: string): Promise<Lead | null> {
  return prisma.lead.findUnique({ where: { id } });
}

export async function contarLeads(): Promise<number> {
  return prisma.lead.count();
}

export async function atualizarStatus(
  id: string,
  novoStatus: StatusLead,
): Promise<Lead> {
  const lead = await buscarLead(id);
  if (!lead) throw new LeadNaoEncontrado(id);

  if (!podeTransicionar(lead.status, novoStatus)) {
    throw new TransicaoInvalida(lead.status, novoStatus);
  }

  return prisma.lead.update({
    where: { id },
    data: { status: novoStatus },
  });
}
