// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_SESSAO, verificarSessao } from "@/lib/auth/sessao";
import { DELETE, POST } from "./route";

function login(corpo: unknown) {
  return POST(
    new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(corpo),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-tamanho-suficiente-hs256");
  vi.stubEnv("ADMIN_USERNAME", "admin");
  vi.stubEnv("ADMIN_PASSWORD", "senha-do-painel");
});

describe("POST /api/auth/session", () => {
  it("emite cookie de sessão válido para credenciais corretas", async () => {
    const resposta = await login({ usuario: "admin", senha: "senha-do-painel" });

    expect(resposta.status).toBe(200);

    const cookie = resposta.cookies.get(COOKIE_SESSAO);
    expect(cookie?.value).toBeTruthy();
    await expect(verificarSessao(cookie!.value)).resolves.toMatchObject({
      usuario: "admin",
    });
  });

  it("marca o cookie como httpOnly e SameSite=Lax", async () => {
    const resposta = await login({ usuario: "admin", senha: "senha-do-painel" });
    const cookie = resposta.cookies.get(COOKIE_SESSAO);

    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
  });

  it("recusa senha errada sem emitir cookie", async () => {
    const resposta = await login({ usuario: "admin", senha: "errada" });

    expect(resposta.status).toBe(401);
    expect(resposta.cookies.get(COOKIE_SESSAO)).toBeUndefined();
  });

  it("não revela qual dos dois campos estava errado", async () => {
    const senhaErrada = await login({ usuario: "admin", senha: "errada" });
    const usuarioErrado = await login({ usuario: "root", senha: "senha-do-painel" });

    expect(await senhaErrada.json()).toEqual(await usuarioErrado.json());
  });

  it("recusa corpo sem os campos esperados", async () => {
    expect((await login({})).status).toBe(401);
    expect((await login({ usuario: 1, senha: 2 })).status).toBe(401);
  });
});

describe("DELETE /api/auth/session", () => {
  it("apaga o cookie", async () => {
    const resposta = await DELETE();
    expect(resposta.cookies.get(COOKIE_SESSAO)?.value).toBe("");
  });
});
