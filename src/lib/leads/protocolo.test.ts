import { describe, expect, it } from "vitest";
import { protocoloDoLead } from "./protocolo";

const lead = {
  id: "3f1c9a52-7b4e-4c0d-9a11-2e8f6b0d4a77",
  createdAt: new Date("2026-09-15T12:12:00Z"),
};

describe("protocoloDoLead", () => {
  it("usa o formato SN-ano-4dígitos do design", () => {
    expect(protocoloDoLead(lead)).toMatch(/^SN-2026-\d{4}$/);
  });

  it("é estável para o mesmo lead", () => {
    expect(protocoloDoLead(lead)).toBe(protocoloDoLead(lead));
  });

  it("usa o ano da criação, não o ano corrente", () => {
    const antigo = { ...lead, createdAt: new Date("2024-01-02T10:00:00Z") };
    expect(protocoloDoLead(antigo).startsWith("SN-2024-")).toBe(true);
  });

  it("distingue leads diferentes", () => {
    const outro = { ...lead, id: "8c2d1e40-5a6b-4f3c-8d90-1a2b3c4d5e6f" };
    expect(protocoloDoLead(outro)).not.toBe(protocoloDoLead(lead));
  });

  it("usa o fuso das unidades para decidir o ano na virada", () => {
    // 01/01 00:30 UTC ainda é 31/12 em Teresina.
    const virada = { ...lead, createdAt: new Date("2027-01-01T00:30:00Z") };
    expect(virada.createdAt.getUTCFullYear()).toBe(2027);
    expect(protocoloDoLead(virada).startsWith("SN-2026-")).toBe(true);
  });
});
