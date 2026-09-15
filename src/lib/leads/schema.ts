import { z } from "zod";
import { ehNomeDeModelo } from "@/lib/modelos/catalogo";
import { somenteDigitos } from "@/lib/formato";

export const UNIDADES = ["Teresina", "Timon"] as const;
export type Unidade = (typeof UNIDADES)[number];

export const CANAIS = ["WhatsApp", "Telefone", "Email"] as const;
export type CanalContato = (typeof CANAIS)[number];

const MSG_WHATSAPP = "Número incompleto — use DDD + 9 dígitos.";

export const novoLeadSchema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome."),

  whatsapp: z
    .string()
    .transform(somenteDigitos)
    // DDD brasileiro válido (11–99) seguido do 9 e mais 8 dígitos.
    .refine((digitos) => /^[1-9][1-9]9\d{8}$/.test(digitos), MSG_WHATSAPP),

  modeloInteresse: z
    .string()
    .refine(ehNomeDeModelo, "Escolha um modelo disponível."),

  unidade: z.enum(UNIDADES, "Escolha uma unidade."),

  canalPreferido: z.enum(CANAIS, "Escolha um canal.").default("WhatsApp"),

  consentimento: z
    .literal(true, "É preciso autorizar o contato para enviar.")
    .describe("Consentimento LGPD — sem ele o lead não é gravado."),
});

export type NovoLead = z.infer<typeof novoLeadSchema>;

export type ErrosDeCampo = Partial<Record<keyof NovoLead, string>>;

export function errosDe(erro: z.ZodError<NovoLead>): ErrosDeCampo {
  const erros: ErrosDeCampo = {};

  for (const issue of erro.issues) {
    const campo = issue.path[0] as keyof NovoLead | undefined;
    if (campo && !erros[campo]) erros[campo] = issue.message;
  }

  return erros;
}
