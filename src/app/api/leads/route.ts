import { NextResponse } from "next/server";
import { sessaoDaRequisicao } from "@/lib/auth/guarda";
import { criarLead, listarLeads } from "@/lib/leads/repositorio";
import { errosDe, novoLeadSchema, UNIDADES, type Unidade } from "@/lib/leads/schema";
import { ehStatusLead, type StatusLead } from "@/lib/leads/status";

export async function POST(request: Request) {
  let corpo: unknown;

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const resultado = novoLeadSchema.safeParse(corpo);

  if (!resultado.success) {
    return NextResponse.json(
      { erros: errosDe(resultado.error) },
      { status: 422 },
    );
  }

  const lead = await criarLead(resultado.data);

  return NextResponse.json(
    { id: lead.id, protocolo: lead.protocolo },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  if (!(await sessaoDaRequisicao(request))) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unidade = searchParams.get("unidade");
  const status = searchParams.get("status");

  const leads = await listarLeads({
    unidade: UNIDADES.includes(unidade as Unidade) ? (unidade as Unidade) : undefined,
    status: ehStatusLead(status) ? (status as StatusLead) : undefined,
  });

  return NextResponse.json({ leads });
}
