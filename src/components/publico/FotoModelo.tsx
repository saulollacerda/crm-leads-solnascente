import type { Modelo } from "@/lib/modelos/catalogo";

/**
 * As fotos oficiais Honda ainda não foram fornecidas. Enquanto não existirem
 * em `public/motos/<slug>.jpg`, o bloco reserva o espaço com o mesmo
 * tratamento visual (fundo surface, preto e branco) previsto no design.
 */
export function FotoModelo({
  modelo,
  altura,
}: {
  modelo: Modelo;
  altura: string;
}) {
  return (
    <div
      className={`grayscale-foto flex ${altura} items-center justify-center bg-surface`}
    >
      <span className="px-6 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
        {modelo.nome}
      </span>
    </div>
  );
}
