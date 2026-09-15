import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Modelo } from "./dados";

/** Um modelo já com a foto resolvida — `null` quando o arquivo não existe. */
export type ModeloComFoto = Modelo & { foto: string | null };

// Formatos com transparência vêm primeiro: a foto fica sobre um painel claro,
// e um JPEG do mesmo modelo traz fundo chapado (preto, no material da Honda).
// Assim, soltar o .png ao lado de um .jpg antigo já corrige a exibição.
const EXTENSOES = [".png", ".webp", ".avif", ".jpg", ".jpeg"];
const PASTA = join(process.cwd(), "public", "motos");

/**
 * Procura a foto do modelo em `public/motos` aceitando qualquer extensão de
 * imagem: solta-se o arquivo com o nome do slug e ele aparece, sem editar o
 * catálogo. Roda só no servidor (a página do modelo é pré-renderizada).
 */
function resolverFoto(slug: string): string | null {
  for (const extensao of EXTENSOES) {
    if (existsSync(join(PASTA, slug + extensao))) {
      return `/motos/${slug}${extensao}`;
    }
  }

  return null;
}

export function comFoto(modelo: Modelo): ModeloComFoto {
  return { ...modelo, foto: resolverFoto(modelo.slug) };
}

export function comFotos(modelos: readonly Modelo[]): ModeloComFoto[] {
  return modelos.map(comFoto);
}
