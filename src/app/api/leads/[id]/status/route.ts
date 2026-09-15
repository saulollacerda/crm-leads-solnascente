import { NextResponse } from "next/server";
import { sessaoDaRequisicao } from "@/lib/auth/guarda";
import {
  LeadNaoEncontrado,
  TransicaoInvalida,
  atualizarStatus,
} from "@/lib/leads/repositorio";
import { ehStatusLead } from "@/lib/leads/status";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await sessaoDaRequisicao(request))) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const status = (corpo as { status?: unknown })?.status;

  if (!ehStatusLead(status)) {
    return NextResponse.json({ erro: "Status desconhecido." }, { status: 422 });
  }

  try {
    return NextResponse.json({ lead: await atualizarStatus(id, status) });
  } catch (erro) {
    if (erro instanceof LeadNaoEncontrado) {
      return NextResponse.json({ erro: erro.message }, { status: 404 });
    }
    if (erro instanceof TransicaoInvalida) {
      return NextResponse.json({ erro: erro.message }, { status: 409 });
    }
    throw erro;
  }
}
