import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioLead } from "@/components/publico/FormularioLead";
import { OutrosModelos } from "@/components/publico/OutrosModelos";
import { VitrineModelo } from "@/components/publico/VitrineModelo";
import { buscarModelo, listarModelos, outrosModelos } from "@/lib/modelos/catalogo";

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

export default async function PaginaModelo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const modelo = buscarModelo((await params).slug);
  if (!modelo) notFound();

  // No mobile a ordem do DOM é a do design: modelo, formulário, outros modelos.
  // No desktop a colocação explícita devolve a vitrine e os outros modelos à
  // coluna da esquerda, com o formulário ocupando a direita inteira.
  return (
    <div className="grid lg:grid-cols-[1fr_480px] lg:grid-rows-[auto_1fr]">
      <VitrineModelo modelo={modelo} className="lg:col-start-1 lg:row-start-1" />

      <div className="border-t border-text bg-white px-4 py-6 sm:px-10 sm:py-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0">
        <FormularioLead modelo={modelo} modelos={listarModelos()} />
      </div>

      <OutrosModelos
        modelos={outrosModelos(modelo.slug)}
        className="lg:col-start-1 lg:row-start-2"
      />
    </div>
  );
}
