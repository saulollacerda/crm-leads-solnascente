import { rotuloDoStatus, type StatusLead } from "@/lib/leads/status";

const ESTILOS: Record<StatusLead, string> = {
  Novo: "bg-accent text-bg",
  EmContato: "bg-accent-200 text-accent-800",
  Convertido: "bg-text text-bg",
  Perdido: "border border-neutral-400 text-neutral-700",
};

export function TagStatus({
  status,
  grande = false,
}: {
  status: StatusLead;
  grande?: boolean;
}) {
  return (
    <span
      className={`inline-block font-bold uppercase tracking-[0.08em] ${
        grande ? "px-3.5 py-2 text-[13px]" : "px-2.5 py-1.5 text-[11px]"
      } ${ESTILOS[status]}`}
    >
      {rotuloDoStatus(status)}
    </span>
  );
}
