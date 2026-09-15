import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Lead } from "@/lib/leads/repositorio";
import { PainelLeads } from "./PainelLeads";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

const lead = (parcial: Partial<Lead> = {}): Lead => ({
  id: "lead-1",
  nome: "Ricardo Menezes",
  whatsapp: "86998124471",
  modeloInteresse: "CG 160 Fan",
  unidade: "Teresina",
  canalPreferido: "WhatsApp",
  status: "Novo",
  createdAt: new Date("2026-09-15T12:12:00Z"),
  updatedAt: new Date("2026-09-15T12:12:00Z"),
  ...parcial,
});

function respostaOk(lead: Lead) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ lead }),
  } as Response);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listagem", () => {
  it("mostra os leads com WhatsApp e data formatados", () => {
    render(<PainelLeads leads={[lead()]} total={1} />);

    expect(screen.getByText("Ricardo Menezes")).toBeInTheDocument();
    expect(screen.getByText("(86) 99812-4471")).toBeInTheDocument();
    expect(screen.getByText("15/09 09:12")).toBeInTheDocument();
  });

  it("informa quantos leads o filtro deixou visíveis", () => {
    render(<PainelLeads leads={[lead()]} total={8} />);
    expect(screen.getByText(/1 de 8 · mais recentes primeiro/)).toBeInTheDocument();
  });

  it("explica a lista vazia em vez de mostrar tabela vazia", () => {
    render(<PainelLeads leads={[]} total={8} />);

    expect(screen.getByText("Nenhum lead com esses filtros")).toBeInTheDocument();
    expect(
      screen.getByText("Ajuste unidade ou status para ver outros registros."),
    ).toBeInTheDocument();
  });
});

describe("seleção", () => {
  it("abre o detalhe do lead clicado", async () => {
    const user = userEvent.setup();
    render(<PainelLeads leads={[lead(), lead({ id: "lead-2", nome: "Ana Reis" })]} total={2} />);

    await user.click(screen.getByRole("button", { name: /Ana Reis/ }));

    expect(screen.getByText("Lead selecionado")).toBeInTheDocument();
    expect(screen.getByText("Canal preferido")).toBeInTheDocument();
  });

  it("orienta a selecionar quando nada está selecionado", () => {
    render(<PainelLeads leads={[lead()]} total={1} />);
    expect(screen.queryByText("Lead selecionado")).not.toBeInTheDocument();
  });
});

describe("avanço de status", () => {
  async function selecionar(status: Lead["status"]) {
    const user = userEvent.setup();
    render(<PainelLeads leads={[lead({ status })]} total={1} />);
    await user.click(screen.getByRole("button", { name: /Ricardo Menezes/ }));
    return user;
  }

  it("oferece só o próximo passo a partir de Novo", async () => {
    await selecionar("Novo");

    expect(
      screen.getByRole("button", { name: "Marcar como Em contato" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Marcar como Convertido" }),
    ).not.toBeInTheDocument();
  });

  it("oferece os dois desfechos a partir de Em contato", async () => {
    await selecionar("EmContato");

    expect(
      screen.getByRole("button", { name: "Marcar como Convertido" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Marcar como Perdido" }),
    ).toBeInTheDocument();
  });

  it.each(["Convertido", "Perdido"] as const)(
    "não oferece ação em %s, que é estado final",
    async (status) => {
      await selecionar(status);

      expect(screen.queryByRole("button", { name: /Marcar como/ })).not.toBeInTheDocument();
      expect(screen.getByText(/Status final/)).toBeInTheDocument();
    },
  );

  it("mostra a dica contextual do status atual", async () => {
    await selecionar("Novo");

    expect(
      screen.getByText(
        "Todo lead nasce como Novo. O primeiro passo é registrar o contato.",
      ),
    ).toBeInTheDocument();
  });

  it("envia o PATCH e reflete o novo status", async () => {
    vi.mocked(fetch).mockReturnValue(respostaOk(lead({ status: "EmContato" })));
    const user = await selecionar("Novo");

    await user.click(screen.getByRole("button", { name: "Marcar como Em contato" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/leads/lead-1/status");
    expect(init).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(init!.body as string)).toEqual({ status: "EmContato" });

    expect(
      await screen.findByRole("button", { name: "Marcar como Convertido" }),
    ).toBeInTheDocument();
  });

  it("desfaz a mudança otimista quando o servidor recusa", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ erro: "Transição inválida." }),
    } as Response);
    const user = await selecionar("Novo");

    await user.click(screen.getByRole("button", { name: "Marcar como Em contato" }));

    expect(
      await screen.findByRole("button", { name: "Marcar como Em contato" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/não foi possível/i);
  });
});
