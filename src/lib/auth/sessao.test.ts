// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assinarSessao, verificarSessao } from "./sessao";

const SEGREDO = "segredo-de-teste-com-tamanho-suficiente-para-hs256";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("SESSION_SECRET", SEGREDO);
});

describe("assinarSessao / verificarSessao", () => {
  it("devolve o usuário de um token que ele mesmo assinou", async () => {
    const token = await assinarSessao("admin");
    await expect(verificarSessao(token)).resolves.toMatchObject({ usuario: "admin" });
  });

  it("rejeita token com assinatura adulterada", async () => {
    const token = await assinarSessao("admin");
    const adulterado = `${token.slice(0, -4)}aaaa`;
    await expect(verificarSessao(adulterado)).resolves.toBeNull();
  });

  it("rejeita token assinado com outro segredo", async () => {
    const token = await assinarSessao("admin");
    vi.stubEnv("SESSION_SECRET", "outro-segredo-completamente-diferente-aqui");
    await expect(verificarSessao(token)).resolves.toBeNull();
  });

  it("rejeita token expirado", async () => {
    const token = await assinarSessao("admin", { expiraEm: "-1s" });
    await expect(verificarSessao(token)).resolves.toBeNull();
  });

  it("rejeita lixo no lugar do token", async () => {
    await expect(verificarSessao("nao-e-um-jwt")).resolves.toBeNull();
    await expect(verificarSessao("")).resolves.toBeNull();
  });

  it("falha alto se o segredo não estiver configurado", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    await expect(assinarSessao("admin")).rejects.toThrow(/SESSION_SECRET/);
  });
});
