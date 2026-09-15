import { beforeEach, describe, expect, it, vi } from "vitest";
import { credenciaisValidas } from "./credenciais";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("ADMIN_USERNAME", "admin");
  vi.stubEnv("ADMIN_PASSWORD", "senha-do-painel");
});

describe("credenciaisValidas", () => {
  it("aceita usuário e senha corretos", () => {
    expect(credenciaisValidas("admin", "senha-do-painel")).toBe(true);
  });

  it.each([
    ["senha errada", "admin", "outra-senha"],
    ["usuário errado", "root", "senha-do-painel"],
    ["ambos errados", "root", "outra-senha"],
    ["campos vazios", "", ""],
    ["senha com prefixo correto", "admin", "senha-do-painel-mais"],
  ])("recusa %s", (_caso, usuario, senha) => {
    expect(credenciaisValidas(usuario, senha)).toBe(false);
  });

  it("recusa qualquer login se as env vars não estiverem configuradas", () => {
    vi.stubEnv("ADMIN_USERNAME", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(credenciaisValidas("", "")).toBe(false);
  });
});
