import { MicroLabel } from "@/components/ui/campos";

export function MenuLateral({
  quantidadeDeLeads,
}: {
  quantidadeDeLeads: number;
}) {
  return (
    <nav className="shrink-0 border-b border-neutral-300 bg-surface px-4 py-4 lg:w-[212px] lg:border-b-0 lg:border-r lg:px-0 lg:py-6">
      <MicroLabel className="px-0 lg:px-6">Operação</MicroLabel>

      <ul className="mt-3 flex gap-2 lg:flex-col lg:gap-0">
        <li className="flex items-center justify-between border-l-2 border-accent bg-white px-3 py-2.5 text-[13px] font-bold lg:px-6 lg:py-3">
          <span>Leads</span>
          <span className="ml-3 text-neutral-700">{quantidadeDeLeads}</span>
        </li>

        {/* Sem tela própria nesta versão — ficam visíveis como o painel prevê, mas inertes. */}
        {["Unidades", "Modelos"].map((item) => (
          <li
            key={item}
            className="px-3 py-2.5 text-[13px] text-neutral-600 lg:px-6 lg:py-3"
          >
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
}
