const ANO = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Fortaleza",
  year: "numeric",
});

/**
 * Número que o cliente vê na tela de sucesso. Derivado do lead, sem coluna
 * própria — se virar referência de atendimento, passa a ser sequência no banco.
 */
export function protocoloDoLead(lead: { id: string; createdAt: Date }): string {
  const digitos = [...lead.id].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 10000,
    7,
  );

  return `SN-${ANO.format(lead.createdAt)}-${String(digitos).padStart(4, "0")}`;
}
