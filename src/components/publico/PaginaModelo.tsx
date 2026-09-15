"use client";

import { useState } from "react";
import type { ModeloComFoto } from "@/lib/modelos/fotos";
import { FormularioLead } from "./FormularioLead";
import { OutrosModelos } from "./OutrosModelos";
import { VitrineModelo } from "./VitrineModelo";

/**
 * O modelo em destaque vive aqui para que trocá-lo no formulário atualize a
 * vitrine na hora, sem recarregar a página nem perder o que já foi digitado.
 * A rota continua sendo a do modelo pelo qual a pessoa chegou; os cards de
 * "Outros modelos" seguem navegando de verdade.
 */
export function PaginaModelo({
  modelo: modeloInicial,
  modelos,
}: {
  modelo: ModeloComFoto;
  modelos: readonly ModeloComFoto[];
}) {
  const [modelo, setModelo] = useState(modeloInicial);

  const outros = modelos.filter((m) => m.slug !== modelo.slug).slice(0, 3);

  function trocarModelo(nome: string) {
    const escolhido = modelos.find((m) => m.nome === nome);
    if (escolhido) setModelo(escolhido);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_480px] lg:grid-rows-[auto_1fr]">
      <VitrineModelo modelo={modelo} className="lg:col-start-1 lg:row-start-1" />

      <div className="border-t border-text bg-white px-4 py-6 sm:px-10 sm:py-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0">
        <FormularioLead
          modelo={modelo}
          modelos={modelos}
          onTrocarModelo={trocarModelo}
        />
      </div>

      <OutrosModelos modelos={outros} className="lg:col-start-1 lg:row-start-2" />
    </div>
  );
}
