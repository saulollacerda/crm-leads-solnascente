/** Teresina e Timon; fixado para o painel não mudar de dia conforme o fuso do servidor. */
const FUSO_UNIDADES = "America/Fortaleza";

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function formatarWhatsapp(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);

  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : "";
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return MOEDA.format(valor).replace(" ", " ");
}

const DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_UNIDADES,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatarDataHora(data: Date): string {
  const partes = DATA_HORA.formatToParts(data);
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? "";

  return `${parte("day")}/${parte("month")} ${parte("hour")}:${parte("minute")}`;
}
