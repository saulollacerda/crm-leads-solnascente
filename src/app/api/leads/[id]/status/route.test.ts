// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, assinarSessao } from "@/lib/auth/sessao";
import { atualizarStatus, criarLead } from "@/lib/leads/repositorio";
import { PATCH } from "./route";

const base = {
  nome: "Ricardo Menezes",
  whatsapp: "86998124471",
  modeloInteresse: "CG 160 Fan",
  unidade: "Teresina" as const,
  canalPreferido: "WhatsApp" as const,
  consentimento: true as const,
};

let cookie: string;

function patch(id: string, corpo: unknown, comCookie = cookie) {
  return PATCH(
    new Request(`http://localhost/api/leads/${id}/status`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        ...(comCookie ? { cookie: comCookie } : {}),
      },
      body: JSON.stringify(corpo),
    }),
    { params: Promise.resolve({ id }) },
  );
}

beforeEach(async () => {
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-tamanho-suficiente-hs256");
  cookie = `${COOKIE_SESSAO}=${await assinarSessao("admin")}`;
  await prisma.lead.deleteMany();
});

describe("PATCH /api/leads/[id]/status", () => {
  it("exige sessão", async () => {
    const lead = await criarLead(base);
    expect((await patch(lead.id, { status: "EmContato" }, "")).status).toBe(401);
  });

  it("avança o status pelo fluxo permitido", async () => {
    const lead = await criarLead(base);
    const resposta = await patch(lead.id, { status: "EmContato" });

    expect(resposta.status).toBe(200);
    expect((await resposta.json()).lead.status).toBe("EmContato");
  });

  it("devolve 409 na transição inválida e não altera o lead", async () => {
    const lead = await criarLead(base);
    const resposta = await patch(lead.id, { status: "Convertido" });

    expect(resposta.status).toBe(409);
    expect((await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } })).status).toBe(
      "Novo",
    );
  });

  it("devolve 409 ao tentar sair de um estado final", async () => {
    const lead = await criarLead(base);
    await atualizarStatus(lead.id, "EmContato");
    await atualizarStatus(lead.id, "Convertido");

    expect((await patch(lead.id, { status: "Perdido" })).status).toBe(409);
  });

  it("devolve 422 para status desconhecido", async () => {
    const lead = await criarLead(base);
    expect((await patch(lead.id, { status: "Vendido" })).status).toBe(422);
  });

  it("devolve 404 para lead inexistente", async () => {
    const resposta = await patch(
      "3f1c9a52-7b4e-4c0d-9a11-2e8f6b0d4a77",
      { status: "EmContato" },
    );
    expect(resposta.status).toBe(404);
  });

  it("verifica a sessão antes de olhar o corpo", async () => {
    expect((await patch("qualquer", { status: "Vendido" }, "")).status).toBe(401);
  });
});
