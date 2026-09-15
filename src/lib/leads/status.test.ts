import { describe, expect, it } from "vitest";
import {
  STATUS_LEAD,
  dicaDoStatus,
  labelDaTransicao,
  podeTransicionar,
  rotuloDoStatus,
  transicoesDe,
  type StatusLead,
} from "./status";

describe("transicoesDe", () => {
  it("leva Novo apenas para Em contato", () => {
    expect(transicoesDe("Novo")).toEqual(["EmContato"]);
  });

  it("leva Em contato para Convertido ou Perdido", () => {
    expect(transicoesDe("EmContato")).toEqual(["Convertido", "Perdido"]);
  });

  it.each(["Convertido", "Perdido"] as const)(
    "não oferece saída a partir de %s, que é estado final",
    (status) => {
      expect(transicoesDe(status)).toEqual([]);
    },
  );
});

describe("podeTransicionar", () => {
  const validas: Array<[StatusLead, StatusLead]> = [
    ["Novo", "EmContato"],
    ["EmContato", "Convertido"],
    ["EmContato", "Perdido"],
  ];

  it.each(validas)("aceita %s → %s", (de, para) => {
    expect(podeTransicionar(de, para)).toBe(true);
  });

  // Toda combinação que não está na lista de válidas precisa ser recusada:
  // é o que impede pular o contato inicial ou reabrir um estado final.
  const invalidas = STATUS_LEAD.flatMap((de) =>
    STATUS_LEAD.filter(
      (para) => !validas.some(([d, p]) => d === de && p === para),
    ).map((para) => [de, para] as const),
  );

  it.each(invalidas)("recusa %s → %s", (de, para) => {
    expect(podeTransicionar(de, para)).toBe(false);
  });

  it("recusa transição para o próprio status", () => {
    expect(podeTransicionar("Novo", "Novo")).toBe(false);
  });

  it("recusa o atalho de Novo direto para Convertido", () => {
    expect(podeTransicionar("Novo", "Convertido")).toBe(false);
  });
});

describe("rótulos e textos", () => {
  it("exibe EmContato como 'Em contato'", () => {
    expect(rotuloDoStatus("EmContato")).toBe("Em contato");
  });

  it("nomeia a ação com o status de destino", () => {
    expect(labelDaTransicao("EmContato")).toBe("Marcar como Em contato");
    expect(labelDaTransicao("Perdido")).toBe("Marcar como Perdido");
  });

  it("explica o que fazer em cada status", () => {
    expect(dicaDoStatus("Novo")).toBe(
      "Todo lead nasce como Novo. O primeiro passo é registrar o contato.",
    );
    expect(dicaDoStatus("Convertido")).toBe("Status final — venda registrada.");
  });
});
