import { describe, expect, it } from "vitest";
import { errosDe, novoLeadSchema } from "./schema";

const valido = {
  nome: "Ricardo Menezes",
  whatsapp: "(86) 99812-4471",
  modeloInteresse: "CG 160 Fan",
  unidade: "Teresina",
  canalPreferido: "WhatsApp",
  consentimento: true,
};

describe("novoLeadSchema", () => {
  it("aceita um envio completo e normaliza o WhatsApp para dígitos", () => {
    const resultado = novoLeadSchema.safeParse(valido);
    expect(resultado.success).toBe(true);
    expect(resultado.data?.whatsapp).toBe("86998124471");
  });

  it("aceita o WhatsApp sem máscara", () => {
    const resultado = novoLeadSchema.safeParse({ ...valido, whatsapp: "86998124471" });
    expect(resultado.success).toBe(true);
  });

  it("assume WhatsApp como canal padrão", () => {
    const semCanal = { ...valido, canalPreferido: undefined };
    expect(novoLeadSchema.parse(semCanal).canalPreferido).toBe("WhatsApp");
  });

  // ADR-006: o status não faz parte da entrada — quem envia não escolhe onde o lead nasce.
  it("ignora status enviado no payload", () => {
    const resultado = novoLeadSchema.parse({ ...valido, status: "Convertido" });
    expect(resultado).not.toHaveProperty("status");
  });
});

describe("nome", () => {
  const nomeDe = (nome: string) => novoLeadSchema.parse({ ...valido, nome }).nome;

  it.each([
    "Ricardo Menezes",
    "José da Silva",
    "Ana Sá",
    "Maria D'Ávila",
    "Luís Antônio Gonçalves Júnior",
  ])("aceita %s", (nome) => {
    expect(nomeDe(nome)).toBe(nome);
  });

  it("normaliza espaços sobrando", () => {
    expect(nomeDe("  Ricardo   Menezes  ")).toBe("Ricardo Menezes");
  });

  it.each([
    ["vazio", "", "Informe seu nome."],
    ["só espaços", "   ", "Informe seu nome."],
    ["um nome só", "Ricardo", "Informe nome e sobrenome."],
    ["inicial no lugar do sobrenome", "Ricardo M", "Informe nome e sobrenome."],
    ["com número", "Ricardo 2 Menezes", "Use apenas letras no nome."],
    ["com e-mail", "ricardo@teste.com", "Use apenas letras no nome."],
    ["só símbolos", "!!! ???", "Use apenas letras no nome."],
    ["com tags", "<script>alert(1)</script>", "Use apenas letras no nome."],
  ])("recusa %s", (_caso, nome, mensagem) => {
    expect(erros_de({ ...valido, nome }).nome).toBe(mensagem);
  });

  it("recusa nome absurdamente longo", () => {
    expect(erros_de({ ...valido, nome: "Ricardo ".repeat(20) }).nome).toBe(
      "Nome muito longo.",
    );
  });

  it("guarda o nome normalizado, não o que veio do formulário", () => {
    const resultado = novoLeadSchema.parse({ ...valido, nome: " Ana  Sá " });
    expect(resultado.nome).toBe("Ana Sá");
  });
});

describe("erros por campo", () => {
  it("cobra o nome com a mensagem do design", () => {
    const erros = erros_de({ ...valido, nome: "  " });
    expect(erros.nome).toBe("Informe seu nome.");
  });

  it("recusa WhatsApp incompleto", () => {
    expect(erros_de({ ...valido, whatsapp: "(86) 9981" }).whatsapp).toBe(
      "Número incompleto — use DDD + 9 dígitos.",
    );
  });

  it("recusa celular sem o nono dígito", () => {
    expect(erros_de({ ...valido, whatsapp: "8632210000" }).whatsapp).toBe(
      "Número incompleto — use DDD + 9 dígitos.",
    );
  });

  it("recusa DDD inexistente", () => {
    expect(erros_de({ ...valido, whatsapp: "00998124471" }).whatsapp).toBe(
      "Número incompleto — use DDD + 9 dígitos.",
    );
  });

  it("recusa modelo fora do catálogo", () => {
    expect(erros_de({ ...valido, modeloInteresse: "Harley" }).modeloInteresse).toBe(
      "Escolha um modelo disponível.",
    );
  });

  it("recusa unidade fora das duas lojas", () => {
    expect(erros_de({ ...valido, unidade: "Parnaíba" }).unidade).toBe(
      "Escolha uma unidade.",
    );
  });

  it("exige o consentimento — sem ele o dado não pode ser gravado", () => {
    expect(erros_de({ ...valido, consentimento: false }).consentimento).toBe(
      "É preciso autorizar o contato para enviar.",
    );
  });

  it("reporta todos os campos inválidos de uma vez", () => {
    expect(Object.keys(erros_de({ nome: "", whatsapp: "" }))).toEqual(
      expect.arrayContaining(["nome", "whatsapp", "modeloInteresse", "unidade"]),
    );
  });
});

function erros_de(entrada: unknown) {
  const resultado = novoLeadSchema.safeParse(entrada);
  expect(resultado.success).toBe(false);
  return errosDe(resultado.error!);
}
