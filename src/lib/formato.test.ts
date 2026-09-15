import { describe, expect, it } from "vitest";
import {
  formatarDataHora,
  formatarMoeda,
  formatarWhatsapp,
  somenteDigitos,
} from "./formato";

describe("formatarWhatsapp", () => {
  it("aplica a máscara do design a 11 dígitos", () => {
    expect(formatarWhatsapp("86998124471")).toBe("(86) 99812-4471");
  });

  it("aceita entrada já mascarada sem duplicar símbolos", () => {
    expect(formatarWhatsapp("(86) 99812-4471")).toBe("(86) 99812-4471");
  });

  it("formata parcialmente enquanto a pessoa digita", () => {
    expect(formatarWhatsapp("8")).toBe("(8");
    expect(formatarWhatsapp("86")).toBe("(86");
    expect(formatarWhatsapp("869")).toBe("(86) 9");
    expect(formatarWhatsapp("8699812")).toBe("(86) 99812");
    expect(formatarWhatsapp("86998124")).toBe("(86) 99812-4");
  });

  it("descarta dígitos além dos 11", () => {
    expect(formatarWhatsapp("869981244719999")).toBe("(86) 99812-4471");
  });
});

describe("somenteDigitos", () => {
  it("remove máscara para a persistência", () => {
    expect(somenteDigitos("(86) 99812-4471")).toBe("86998124471");
  });
});

describe("formatarMoeda", () => {
  it("usa o padrão brasileiro", () => {
    expect(formatarMoeda(19994)).toBe("R$ 19.994,00");
    expect(formatarMoeda(446.9)).toBe("R$ 446,90");
  });
});

describe("formatarDataHora", () => {
  it("usa DD/MM HH:mm, sem ano, como no painel", () => {
    expect(formatarDataHora(new Date("2026-09-15T12:12:00Z"))).toBe("15/09 09:12");
  });

  it("formata no fuso das unidades, não no do servidor", () => {
    // Em UTC seria 16/09 00:30; para a equipe em Teresina ainda é dia 15.
    expect(formatarDataHora(new Date("2026-09-16T00:30:00Z"))).toBe("15/09 21:30");
  });
});
