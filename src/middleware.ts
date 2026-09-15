import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, verificarSessao } from "@/lib/auth/sessao";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_SESSAO)?.value ?? "";

  if (await verificarSessao(token)) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("de", request.nextUrl.pathname);

  return NextResponse.redirect(login);
}

// Só as páginas do painel: a API se protege nos próprios handlers, porque lá
// a resposta correta é 401 em JSON, não um redirect para tela de login.
export const config = {
  matcher: ["/admin/:path*"],
};
