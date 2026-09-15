import { MODELOS, type Modelo } from "./dados";

export type { Modelo };

/**
 * Contrato de leitura do catálogo (ADR-012). A fonte hoje é estática; quando
 * o estoque da concessionária for integrado, só estas funções mudam.
 */
export function listarModelos(): readonly Modelo[] {
  return MODELOS;
}

export function buscarModelo(slug: string): Modelo | undefined {
  return MODELOS.find((modelo) => modelo.slug === slug);
}

export function modeloDestaque(): Modelo {
  return MODELOS[0];
}

export function outrosModelos(slugAtual: string): readonly Modelo[] {
  return MODELOS.filter((modelo) => modelo.slug !== slugAtual).slice(0, 3);
}

export function ehNomeDeModelo(nome: string): boolean {
  return MODELOS.some((modelo) => modelo.nome === nome);
}
