import { existsSync } from "node:fs";
import { join } from "node:path";

const EXTENSOES = [".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg"];
const PASTA = join(process.cwd(), "public", "marca");

function encontrar(nome: string): string | null {
  for (const extensao of EXTENSOES) {
    if (existsSync(join(PASTA, nome + extensao))) return `/marca/${nome}${extensao}`;
  }

  return null;
}

/**
 * Procura a logo em `public/marca`, aceitando qualquer formato de imagem.
 * `logo-clara` é a versão para fundo escuro (barra do admin); sem ela, a
 * normal é usada nos dois lugares. `null` quando não há arquivo nenhum —
 * aí vale a logo tipográfica do design.
 */
export function logoOficial(escuro: boolean): string | null {
  return (escuro ? encontrar("logo-clara") : null) ?? encontrar("logo");
}
