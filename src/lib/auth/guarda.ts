import { COOKIE_SESSAO, verificarSessao, type Sessao } from "./sessao";

function lerCookie(cabecalho: string | null, nome: string): string {
  if (!cabecalho) return "";

  for (const parte of cabecalho.split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }

  return "";
}

/**
 * Verificação de sessão feita no próprio handler, e não só no middleware:
 * a API lê e altera dado pessoal, então a proteção não depende de um matcher
 * de rota continuar correto depois de uma refatoração.
 */
export async function sessaoDaRequisicao(
  request: Request,
): Promise<Sessao | null> {
  return verificarSessao(lerCookie(request.headers.get("cookie"), COOKIE_SESSAO));
}
