import { NextResponse } from "next/server";
import { credenciaisValidas } from "@/lib/auth/credenciais";
import { COOKIE_SESSAO, assinarSessao } from "@/lib/auth/sessao";

const OITO_HORAS = 60 * 60 * 8;

export async function POST(request: Request) {
  let corpo: unknown;

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const { usuario, senha } = (corpo ?? {}) as Record<string, unknown>;

  if (typeof usuario !== "string" || typeof senha !== "string") {
    return NextResponse.json({ erro: "Credenciais inválidas." }, { status: 401 });
  }

  if (!credenciaisValidas(usuario, senha)) {
    // Mensagem única para usuário e senha: não confirma qual dos dois existe.
    return NextResponse.json({ erro: "Credenciais inválidas." }, { status: 401 });
  }

  const resposta = NextResponse.json({ usuario });

  resposta.cookies.set(COOKIE_SESSAO, await assinarSessao(usuario), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OITO_HORAS,
  });

  return resposta;
}

export async function DELETE() {
  const resposta = NextResponse.json({ encerrada: true });
  resposta.cookies.delete(COOKIE_SESSAO);
  return resposta;
}
