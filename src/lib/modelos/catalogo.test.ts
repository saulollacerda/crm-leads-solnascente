import { describe, expect, it } from "vitest";
import {
  buscarModelo,
  ehNomeDeModelo,
  listarModelos,
  modeloDestaque,
  outrosModelos,
} from "./catalogo";

describe("listarModelos", () => {
  it("devolve o catálogo completo", () => {
    expect(listarModelos()).toHaveLength(8);
  });

  it("dá a cada modelo os atributos que a vitrine exibe", () => {
    for (const modelo of listarModelos()) {
      expect(modelo).toMatchObject({
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
        nome: expect.any(String),
        categoria: expect.any(String),
        motor: expect.any(String),
      });
      expect(modelo.preco).toBeGreaterThan(0);
      expect(modelo.parcela48x).toBeGreaterThan(0);
    }
  });

  it("não repete slug", () => {
    const slugs = listarModelos().map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("buscarModelo", () => {
  it("encontra pelo slug", () => {
    expect(buscarModelo("cg-160-fan")).toMatchObject({
      nome: "CG 160 Fan",
      categoria: "Street",
      preco: 19994,
      parcela48x: 446.9,
      motor: "162,7 cc",
    });
  });

  it("devolve undefined para slug inexistente", () => {
    expect(buscarModelo("harley-davidson")).toBeUndefined();
  });
});

describe("modeloDestaque", () => {
  it("é a CG 160 Fan, o único com preço confirmado pela concessionária", () => {
    expect(modeloDestaque().slug).toBe("cg-160-fan");
  });
});

describe("outrosModelos", () => {
  it("exclui o modelo atual", () => {
    const outros = outrosModelos("cg-160-fan");
    expect(outros.some((m) => m.slug === "cg-160-fan")).toBe(false);
  });

  it("devolve os 3 usados na faixa 'Outros modelos'", () => {
    expect(outrosModelos("cg-160-fan")).toHaveLength(3);
  });
});

describe("ehNomeDeModelo", () => {
  it("aceita nome existente no catálogo", () => {
    expect(ehNomeDeModelo("Biz 125")).toBe(true);
  });

  it("recusa nome fora do catálogo", () => {
    expect(ehNomeDeModelo("Biz 125 turbo")).toBe(false);
  });
});
