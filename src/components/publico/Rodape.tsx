import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { logoOficial } from "@/lib/marca";
import { listarModelos } from "@/lib/modelos/catalogo";

/**
 * Itens sem `href` são renderizados como texto, não como link morto: só os
 * modelos têm destino real hoje. Quando houver as páginas (ou as URLs das
 * redes sociais), basta preencher o `href`.
 */
type Item = { texto: string; href?: string };

const COLUNAS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: "Motos",
    itens: listarModelos()
      .slice(0, 4)
      .map((modelo) => ({
        texto: modelo.nome,
        href: `/modelos/${modelo.slug}`,
      })),
  },
  {
    titulo: "Serviços",
    itens: [
      { texto: "Consórcio" },
      { texto: "Financiamento" },
      { texto: "Peças e acessórios" },
      { texto: "Revisão e pós-venda" },
    ],
  },
  {
    titulo: "Sol Nascente",
    itens: [
      { texto: "Unidade Teresina" },
      { texto: "Unidade Timon" },
      { texto: "Trabalhe conosco" },
      { texto: "Contato" },
    ],
  },
];

export function Rodape() {
  return (
    <footer className="regua-fina-topo">
      <div className="grid gap-12 px-4 py-12 sm:px-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Logo src={logoOficial(false)} />

          <p className="mt-8 text-[15px] font-extrabold">Siga nas redes sociais</p>

          <div className="mt-4 flex gap-4 text-neutral-800">
            <Facebook />
            <Instagram />
            <Youtube />
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-16">
          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <h2 className="text-[15px] font-extrabold text-accent">
                {coluna.titulo}
              </h2>

              <ul className="mt-5 flex flex-col gap-3.5">
                {coluna.itens.map((item) => (
                  <li key={item.texto} className="text-[13px] text-neutral-800">
                    {item.href ? (
                      <Link href={item.href} className="hover:text-accent">
                        {item.texto}
                      </Link>
                    ) : (
                      item.texto
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-neutral-300 px-4 py-4 text-[12px] text-neutral-800 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-semibold uppercase tracking-[0.02em]">
          Desacelere. Seu bem maior é a vida.
        </p>

        <p className="flex flex-wrap gap-x-6 gap-y-1">
          <span>Política de privacidade</span>
          <span>Termos de uso</span>
          <span>© {new Date().getFullYear()} Sol Nascente Motos</span>
        </p>
      </div>
    </footer>
  );
}

function Facebook() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Facebook"
      role="img"
      className="size-6"
    >
      <path d="M14.5 8.5h2.2V5.6c-.4-.05-1.7-.16-3.2-.16-3.2 0-5.3 1.9-5.3 5.4V13H5.5v3.3h2.7V24h3.4v-7.7h2.7l.4-3.3h-3.1v-1.8c0-1 .3-1.7 1.9-1.7z" />
    </svg>
  );
}

function Instagram() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label="Instagram"
      role="img"
      className="size-6"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Youtube() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="YouTube"
      role="img"
      className="size-6"
    >
      <path d="M22.5 7.4a2.8 2.8 0 0 0-1.9-2C18.9 5 12 5 12 5s-6.9 0-8.6.4a2.8 2.8 0 0 0-1.9 2C1.1 9.1 1.1 12 1.1 12s0 2.9.4 4.6a2.8 2.8 0 0 0 1.9 2c1.7.4 8.6.4 8.6.4s6.9 0 8.6-.4a2.8 2.8 0 0 0 1.9-2c.4-1.7.4-4.6.4-4.6s0-2.9-.4-4.6zM9.8 15.3V8.7l5.7 3.3z" />
    </svg>
  );
}
