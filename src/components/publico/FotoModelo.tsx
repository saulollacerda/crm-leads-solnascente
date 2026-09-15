"use client";

import Image from "next/image";
import { useState } from "react";
import type { ModeloComFoto } from "@/lib/modelos/fotos";

/**
 * Enquanto não houver arquivo para o modelo em `public/motos`, o bloco mostra
 * o espaço reservado com o tratamento visual do design. Basta soltar a imagem
 * na pasta para ela aparecer, sem mudar código.
 */
export function FotoModelo({
  modelo,
  altura,
}: {
  modelo: ModeloComFoto;
  altura: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const semArquivo = !modelo.foto || falhou;

  return (
    <div
      className={`grayscale-foto relative flex ${altura} items-center justify-center bg-surface`}
    >
      {semArquivo ? (
        <span className="px-6 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
          {modelo.nome}
        </span>
      ) : (
        <Image
          src={modelo.foto!}
          alt={`Honda ${modelo.nome}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain p-4 sm:p-6"
          onError={() => setFalhou(true)}
        />
      )}
    </div>
  );
}
