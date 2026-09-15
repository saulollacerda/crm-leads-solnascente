// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// `fotos.ts` lê a partir de process.cwd(); o teste roda numa pasta temporária
// com a mesma estrutura, para não depender das imagens reais do repositório.
const raiz = mkdtempSync(join(tmpdir(), "motos-"));
const cwdOriginal = process.cwd;

beforeAll(() => {
  mkdirSync(join(raiz, "public", "motos"), { recursive: true });
  process.cwd = () => raiz;
});

afterAll(() => {
  process.cwd = cwdOriginal;
  rmSync(raiz, { recursive: true, force: true });
});

function soltarArquivo(nome: string) {
  writeFileSync(join(raiz, "public", "motos", nome), "");
}

const modelo = {
  slug: "cg-160-fan",
  nome: "CG 160 Fan",
  categoria: "Street",
  preco: 19994,
  parcela48x: 446.9,
  motor: "162,7 cc",
};

describe("comFoto", () => {
  it("devolve null quando não há arquivo para o modelo", async () => {
    const { comFoto } = await import("./fotos");
    expect(comFoto(modelo).foto).toBeNull();
  });

  it("encontra o arquivo .jpg pelo slug", async () => {
    const { comFoto } = await import("./fotos");
    soltarArquivo("cg-160-fan.jpg");

    expect(comFoto(modelo).foto).toBe("/motos/cg-160-fan.jpg");
  });

  // O bug que motivou isto: a foto era .png e o catálogo apontava para .jpg.
  it.each([".png", ".webp", ".jpeg", ".avif"])(
    "encontra o arquivo também em %s",
    async (extensao) => {
      const { comFoto } = await import("./fotos");
      const slug = `modelo${extensao.replace(".", "")}`;
      soltarArquivo(slug + extensao);

      expect(comFoto({ ...modelo, slug }).foto).toBe(`/motos/${slug}${extensao}`);
    },
  );

  it("prefere o formato com transparência quando os dois existem", async () => {
    const { comFoto } = await import("./fotos");
    soltarArquivo("dois-formatos.jpg");
    soltarArquivo("dois-formatos.png");

    expect(comFoto({ ...modelo, slug: "dois-formatos" }).foto).toBe(
      "/motos/dois-formatos.png",
    );
  });

  it("preserva os demais campos do modelo", async () => {
    const { comFoto } = await import("./fotos");
    expect(comFoto(modelo)).toMatchObject({ nome: "CG 160 Fan", preco: 19994 });
  });
});
