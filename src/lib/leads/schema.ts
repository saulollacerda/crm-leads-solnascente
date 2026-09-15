import { z } from "zod";
import { ehNomeDeModelo } from "@/lib/modelos/catalogo";
import { somenteDigitos } from "@/lib/formato";

export const UNIDADES = ["Teresina", "Timon"] as const;
export type Unidade = (typeof UNIDADES)[number];

export const CANAIS = ["WhatsApp", "Telefone", "Email"] as const;
export type CanalContato = (typeof CANAIS)[number];

const MSG_WHATSAPP = "Número incompleto — use DDD + 9 dígitos.";

// Letras de qualquer alfabeto mais o que aparece em nome próprio: espaço,
// apóstrofo e hífen. `\p{L}` cobre acentuação sem listar caractere por caractere.
const SO_LETRAS = /^\p{L}[\p{L}'’.-]*(?: [\p{L}'’.-]+)*$/u;

/** Nome e sobrenome: quem vai ligar para o lead precisa saber por quem chamar. */
function temNomeESobrenome(nome: string): boolean {
  return nome.split(" ").filter((parte) => parte.length >= 2).length >= 2;
}

export const novoLeadSchema = z.object({
  nome: z
    .string()
    .transform((valor) => valor.trim().replace(/\s+/g, " "))
    .refine((nome) => nome.length > 0, "Informe seu nome.")
    .refine((nome) => nome.length <= 80, "Nome muito longo.")
    .refine((nome) => SO_LETRAS.test(nome), "Use apenas letras no nome.")
    .refine(temNomeESobrenome, "Informe nome e sobrenome."),

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
