import { SignJWT, jwtVerify } from "jose";

export const COOKIE_SESSAO = "sn_sessao";

export type Sessao = { usuario: string };

/** `jose` usa Web Crypto, então isto roda tanto no middleware (edge) quanto nas rotas. */
function segredo(): Uint8Array {
  const valor = process.env.SESSION_SECRET;
  if (!valor) throw new Error("SESSION_SECRET não configurado.");
  return new TextEncoder().encode(valor);
}

export async function assinarSessao(
  usuario: string,
  opcoes: { expiraEm?: string } = {},
): Promise<string> {
  return new SignJWT({ usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(opcoes.expiraEm ?? "8h")
    .sign(segredo());
}

export async function verificarSessao(token: string): Promise<Sessao | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, segredo());
    return typeof payload.usuario === "string" ? { usuario: payload.usuario } : null;
  } catch {
    return null;
  }
}
