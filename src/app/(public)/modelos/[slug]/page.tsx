import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaModelo } from "@/components/publico/PaginaModelo";
import { buscarModelo, listarModelos } from "@/lib/modelos/catalogo";

export function generateStaticParams() {
  return listarModelos().map((modelo) => ({ slug: modelo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const modelo = buscarModelo((await params).slug);
  if (!modelo) return {};

  return {
    title: `${modelo.nome} — Sol Nascente Motos`,
    description: `Fale com um especialista da Sol Nascente sobre a ${modelo.nome}.`,
  };
}

export default async function Pagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const modelo = buscarModelo((await params).slug);
  if (!modelo) notFound();

  return <PaginaModelo modelo={modelo} modelos={listarModelos()} />;
}
