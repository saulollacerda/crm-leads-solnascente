export const STATUS_LEAD = [
  "Novo",
  "EmContato",
  "Convertido",
  "Perdido",
] as const;

export type StatusLead = (typeof STATUS_LEAD)[number];

const TRANSICOES: Record<StatusLead, readonly StatusLead[]> = {
  Novo: ["EmContato"],
  EmContato: ["Convertido", "Perdido"],
  Convertido: [],
  Perdido: [],
};

const ROTULOS: Record<StatusLead, string> = {
  Novo: "Novo",
  EmContato: "Em contato",
  Convertido: "Convertido",
  Perdido: "Perdido",
};

const DICAS: Record<StatusLead, string> = {
  Novo: "Todo lead nasce como Novo. O primeiro passo é registrar o contato.",
  EmContato: "Do contato, o lead segue para Convertido (venda) ou Perdido.",
  Convertido: "Status final — venda registrada.",
  Perdido: "Status final — lead não avançou.",
};

export function transicoesDe(status: StatusLead): readonly StatusLead[] {
  return TRANSICOES[status];
}

export function podeTransicionar(de: StatusLead, para: StatusLead): boolean {
  return TRANSICOES[de].includes(para);
}

export function rotuloDoStatus(status: StatusLead): string {
  return ROTULOS[status];
}

export function dicaDoStatus(status: StatusLead): string {
  return DICAS[status];
}

export function labelDaTransicao(destino: StatusLead): string {
  return `Marcar como ${ROTULOS[destino]}`;
}

export function ehStatusLead(valor: unknown): valor is StatusLead {
  return STATUS_LEAD.includes(valor as StatusLead);
}
