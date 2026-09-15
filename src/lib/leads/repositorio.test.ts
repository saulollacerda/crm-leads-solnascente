// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  LeadNaoEncontrado,
  TransicaoInvalida,
  atualizarStatus,
  criarLead,
  listarLeads,
} from "./repositorio";
import type { NovoLead } from "./schema";

const base: NovoLead = {
  nome: "Ricardo Menezes",
  whatsapp: "86998124471",
  modeloInteresse: "CG 160 Fan",
  unidade: "Teresina",
  canalPreferido: "WhatsApp",
  consentimento: true,
};

beforeEach(async () => {
  await prisma.lead.deleteMany();
});

describe("criarLead", () => {
  it("grava o lead com os dados do formulário", async () => {
    const lead = await criarLead(base);

    expect(lead).toMatchObject({
      nome: "Ricardo Menezes",
      whatsapp: "86998124471",
      modeloInteresse: "CG 160 Fan",
      unidade: "Teresina",
      canalPreferido: "WhatsApp",
    });
    expect(lead.id).toBeTruthy();
  });

  // ADR-006: o default vem do banco, então vale para qualquer origem de escrita.
  it("nasce com status Novo", async () => {
    expect((await criarLead(base)).status).toBe("Novo");
  });

  it("ganha um protocolo no formato que o cliente recebe", async () => {
    expect((await criarLead(base)).protocolo).toMatch(/^SN-\d{4}-\d{4}$/);
  });

  it("não repete protocolo entre leads", async () => {
    const protocolos = await Promise.all(
      Array.from({ length: 5 }, () => criarLead(base).then((l) => l.protocolo)),
    );

    expect(new Set(protocolos).size).toBe(5);
  });

  it("mantém o protocolo ao avançar o status", async () => {
    const lead = await criarLead(base);
    const depois = await atualizarStatus(lead.id, "EmContato");

    expect(depois.protocolo).toBe(lead.protocolo);
  });

  it("registra quando e sob qual versão o consentimento foi dado", async () => {
    const lead = await criarLead(base);
    const gravado = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });

    expect(gravado.consentimentoEm).toBeInstanceOf(Date);
    expect(gravado.consentimentoVersao).toBe("2026-09-15");
  });
});

describe("listarLeads", () => {
  beforeEach(async () => {
    await criarLead({ ...base, nome: "Primeiro" });
    await criarLead({ ...base, nome: "Segundo", unidade: "Timon" });
    await criarLead({ ...base, nome: "Terceiro" });
  });

  it("devolve os mais recentes primeiro", async () => {
    const leads = await listarLeads();
    expect(leads.map((l) => l.nome)).toEqual(["Terceiro", "Segundo", "Primeiro"]);
  });

  it("filtra por unidade", async () => {
    const leads = await listarLeads({ unidade: "Timon" });
    expect(leads.map((l) => l.nome)).toEqual(["Segundo"]);
  });

  it("filtra por status", async () => {
    expect(await listarLeads({ status: "Convertido" })).toEqual([]);
    expect(await listarLeads({ status: "Novo" })).toHaveLength(3);
  });

  it("combina unidade e status", async () => {
    const leads = await listarLeads({ unidade: "Teresina", status: "Novo" });
    expect(leads).toHaveLength(2);
  });
});

describe("atualizarStatus", () => {
  it("avança pelo fluxo permitido", async () => {
    const lead = await criarLead(base);

    const emContato = await atualizarStatus(lead.id, "EmContato");
    expect(emContato.status).toBe("EmContato");

    const convertido = await atualizarStatus(lead.id, "Convertido");
    expect(convertido.status).toBe("Convertido");
  });

  it("toca o updatedAt ao mudar de status", async () => {
    const lead = await criarLead(base);
    const atualizado = await atualizarStatus(lead.id, "EmContato");

    expect(atualizado.updatedAt.getTime()).toBeGreaterThanOrEqual(
      lead.updatedAt.getTime(),
    );
  });

  it("recusa o atalho de Novo para Convertido sem escrever nada", async () => {
    const lead = await criarLead(base);

    await expect(atualizarStatus(lead.id, "Convertido")).rejects.toThrow(
      TransicaoInvalida,
    );

    const depois = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });
    expect(depois.status).toBe("Novo");
  });

  it("recusa sair de um estado final", async () => {
    const lead = await criarLead(base);
    await atualizarStatus(lead.id, "EmContato");
    await atualizarStatus(lead.id, "Perdido");

    await expect(atualizarStatus(lead.id, "EmContato")).rejects.toThrow(
      TransicaoInvalida,
    );
  });

  it("avisa quando o lead não existe", async () => {
    await expect(
      atualizarStatus("3f1c9a52-7b4e-4c0d-9a11-2e8f6b0d4a77", "EmContato"),
    ).rejects.toThrow(LeadNaoEncontrado);
  });
});
