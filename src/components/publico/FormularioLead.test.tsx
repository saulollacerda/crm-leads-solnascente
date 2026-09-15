import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buscarModelo, listarModelos } from "@/lib/modelos/catalogo";
import { FormularioLead } from "./FormularioLead";

const modelo = { ...buscarModelo("cg-160-fan")!, foto: "/motos/cg-160-fan.jpg" };
const modelos = listarModelos().map((m) => ({ ...m, foto: null }));

function montar(onTrocarModelo = vi.fn()) {
  return render(
    <FormularioLead
      modelo={modelo}
      modelos={modelos}
      onTrocarModelo={onTrocarModelo}
    />,
  );
}

async function preencherValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome"), "Ricardo Menezes");
  await user.type(screen.getByLabelText("WhatsApp"), "86998124471");
  await user.click(screen.getByRole("checkbox"));
}

function respostaOk(corpo: unknown, status = 201) {
  return Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(corpo),
  } as Response);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("estado inicial", () => {
  it("mostra os campos do design com seus placeholders", () => {
    montar();

    expect(screen.getByPlaceholderText("Seu nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("(86) 90000-0000")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quero falar com um especialista/i }),
    ).toBeInTheDocument();
  });

  it("já vem com o modelo da página selecionado", () => {
    montar();
    expect(screen.getByLabelText("Modelo de interesse")).toHaveValue("CG 160 Fan");
  });

  it("avisa o pai quando o modelo muda, para a vitrine acompanhar", async () => {
    const user = userEvent.setup();
    const onTrocarModelo = vi.fn();
    montar(onTrocarModelo);

    await user.selectOptions(screen.getByLabelText("Modelo de interesse"), "Biz 125");

    expect(onTrocarModelo).toHaveBeenCalledWith("Biz 125");
  });

  it("assume Teresina e WhatsApp como padrão", () => {
    montar();

    expect(screen.getByRole("button", { name: "Teresina" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "WhatsApp" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("validação no cliente", () => {
  it("não chama a API quando há campo inválido", async () => {
    const user = userEvent.setup();
    montar();

    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(fetch).not.toHaveBeenCalled();
  });

  it("mostra o banner e o erro de cada campo", async () => {
    const user = userEvent.setup();
    montar();

    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(await screen.findByText("Não foi possível enviar")).toBeInTheDocument();
    expect(screen.getByText("Informe seu nome.")).toBeInTheDocument();
    expect(
      screen.getByText("Número incompleto — use DDD + 9 dígitos."),
    ).toBeInTheDocument();
  });

  it("exige o consentimento LGPD", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByLabelText("Nome"), "Ricardo Menezes");
    await user.type(screen.getByLabelText("WhatsApp"), "86998124471");
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(
      await screen.findByText("É preciso autorizar o contato para enviar."),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("cobra nome e sobrenome", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByLabelText("Nome"), "Ricardo");
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(
      await screen.findByText("Informe nome e sobrenome."),
    ).toBeInTheDocument();
  });

  it("some com o erro do campo assim que a pessoa corrige", async () => {
    const user = userEvent.setup();
    montar();

    await user.click(screen.getByRole("button", { name: /quero falar/i }));
    expect(await screen.findByText("Informe seu nome.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nome"), "R");

    expect(screen.queryByText("Informe seu nome.")).not.toBeInTheDocument();
    // O erro do WhatsApp, que ninguém tocou, continua visível.
    expect(
      screen.getByText("Número incompleto — use DDD + 9 dígitos."),
    ).toBeInTheDocument();
  });

  it("aplica a máscara do WhatsApp enquanto a pessoa digita", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByLabelText("WhatsApp"), "86998124471");

    expect(screen.getByLabelText("WhatsApp")).toHaveValue("(86) 99812-4471");
  });
});

describe("envio", () => {
  it("manda os dados do formulário para a API", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockReturnValue(
      respostaOk({ id: "abc", protocolo: "SN-2026-0412" }),
    );
    montar();

    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/leads");
    expect(JSON.parse(init!.body as string)).toMatchObject({
      nome: "Ricardo Menezes",
      whatsapp: "(86) 99812-4471",
      modeloInteresse: "CG 160 Fan",
      unidade: "Teresina",
      canalPreferido: "WhatsApp",
      consentimento: true,
    });
  });

  it("bloqueia os campos e troca o rótulo do botão durante o envio", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    montar();

    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(await screen.findByRole("button", { name: /enviando/i })).toBeDisabled();
    expect(screen.getByLabelText("Nome")).toHaveAttribute("readonly");
  });

  it("mostra a confirmação com protocolo, modelo e canal", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockReturnValue(
      respostaOk({ id: "abc", protocolo: "SN-2026-0412" }),
    );
    montar();

    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(await screen.findByText("Interesse registrado")).toBeInTheDocument();
    expect(screen.getByText("#SN-2026-0412")).toBeInTheDocument();
    expect(screen.getByText("Protocolo")).toBeInTheDocument();
  });

  it("repassa os erros por campo que o servidor devolver", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockReturnValue(
      respostaOk({ erros: { nome: "Informe seu nome." } }, 422),
    );
    montar();

    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(await screen.findByText("Informe seu nome.")).toBeInTheDocument();
  });

  it("avisa sem culpar o usuário quando a rede falha", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    montar();

    await preencherValido(user);
    await user.click(screen.getByRole("button", { name: /quero falar/i }));

    expect(await screen.findByText("Não foi possível enviar")).toBeInTheDocument();
    expect(
      screen.getByText(/tente novamente em instantes/i),
    ).toBeInTheDocument();
  });

  it("não reenvia enquanto o primeiro envio está em voo", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    montar();

    await preencherValido(user);
    const botao = screen.getByRole("button", { name: /quero falar/i });
    await user.click(botao);
    await user.click(await screen.findByRole("button", { name: /enviando/i }));

    expect(fetch).toHaveBeenCalledOnce();
  });
});
