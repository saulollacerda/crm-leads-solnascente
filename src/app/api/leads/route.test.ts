// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, assinarSessao } from "@/lib/auth/sessao";
import { criarLead } from "@/lib/leads/repositorio";
import { GET, POST } from "./route";

const envio = {
  nome: "Ricardo Menezes",
  whatsapp: "(86) 99812-4471",
  modeloInteresse: "CG 160 Fan",
  unidade: "Teresina",
  canalPreferido: "WhatsApp",
  consentimento: true,
};

const leadValido = {
  ...envio,
  whatsapp: "86998124471",
  canalPreferido: "WhatsApp" as const,
  unidade: "Teresina" as const,
  consentimento: true as const,
};

function post(corpo: unknown) {
  return POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(corpo),
    }),
  );
}

async function get(url: string, cookie?: string) {
  return GET(
    new Request(`http://localhost${url}`, {
      headers: cookie ? { cookie } : {},
    }),
  );
}

beforeEach(async () => {
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-tamanho-suficiente-hs256");
  await prisma.lead.deleteMany();
});

describe("POST /api/leads", () => {
  it("cria o lead e devolve o protocolo da tela de sucesso", async () => {
    const resposta = await post(envio);

    expect(resposta.status).toBe(201);
    const corpo = await resposta.json();
    expect(corpo.id).toBeTruthy();
    expect(corpo.protocolo).toMatch(/^SN-\d{4}-\d{4}$/);
  });

  it("é público — não exige sessão", async () => {
    expect((await post(envio)).status).toBe(201);
  });

  it("devolve 422 com erro por campo", async () => {
    const resposta = await post({ ...envio, nome: "", whatsapp: "(86) 9981" });

    expect(resposta.status).toBe(422);
    expect((await resposta.json()).erros).toEqual({
      nome: "Informe seu nome.",
      whatsapp: "Número incompleto — use DDD + 9 dígitos.",
    });
  });

  it("não grava nada quando a validação falha", async () => {
    await post({ ...envio, nome: "" });
    expect(await prisma.lead.count()).toBe(0);
  });

  it("recusa envio sem consentimento", async () => {
    const resposta = await post({ ...envio, consentimento: false });

    expect(resposta.status).toBe(422);
    expect((await resposta.json()).erros.consentimento).toBeTruthy();
    expect(await prisma.lead.count()).toBe(0);
  });

  // ADR-006: quem envia o formulário não escolhe onde o lead nasce.
  it("ignora status injetado no payload e cria como Novo", async () => {
    const resposta = await post({ ...envio, status: "Convertido" });
    const { id } = await resposta.json();

    expect((await prisma.lead.findUniqueOrThrow({ where: { id } })).status).toBe(
      "Novo",
    );
  });

  it("devolve 400 para corpo que não é JSON", async () => {
    const resposta = await POST(
      new Request("http://localhost/api/leads", { method: "POST", body: "{{" }),
    );
    expect(resposta.status).toBe(400);
  });
});

describe("GET /api/leads", () => {
  let cookie: string;

  beforeEach(async () => {
    cookie = `${COOKIE_SESSAO}=${await assinarSessao("admin")}`;
    await criarLead({ ...leadValido, nome: "Teresina 1" });
    await criarLead({ ...leadValido, nome: "Timon 1", unidade: "Timon" });
  });

  it("exige sessão", async () => {
    expect((await get("/api/leads")).status).toBe(401);
  });

  it("recusa cookie adulterado", async () => {
    const adulterado = `${COOKIE_SESSAO}=${(await assinarSessao("admin")).slice(0, -4)}aaaa`;
    expect((await get("/api/leads", adulterado)).status).toBe(401);
  });

  it("lista os leads para quem está autenticado", async () => {
    const resposta = await get("/api/leads", cookie);

    expect(resposta.status).toBe(200);
    expect((await resposta.json()).leads).toHaveLength(2);
  });

  it("filtra por unidade", async () => {
    const resposta = await get("/api/leads?unidade=Timon", cookie);
    const { leads } = await resposta.json();

    expect(leads.map((l: { nome: string }) => l.nome)).toEqual(["Timon 1"]);
  });

  it("ignora filtro com valor desconhecido em vez de quebrar", async () => {
    const resposta = await get("/api/leads?unidade=Parnaíba&status=Sumiu", cookie);

    expect(resposta.status).toBe(200);
    expect((await resposta.json()).leads).toHaveLength(2);
  });
});
