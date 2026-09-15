"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { formatarWhatsapp } from "@/lib/formato";
import type { ModeloComFoto } from "@/lib/modelos/fotos";
import {
  CANAIS,
  UNIDADES,
  errosDe,
  novoLeadSchema,
  type CanalContato,
  type ErrosDeCampo,
  type Unidade,
} from "@/lib/leads/schema";
import {
  BotaoPrimario,
  BotaoSecundario,
  Chip,
  Hint,
  Input,
  Label,
  MensagemErro,
  MicroLabel,
  Select,
  Spinner,
} from "@/components/ui/campos";

const ROTULO_CANAL: Record<CanalContato, string> = {
  WhatsApp: "WhatsApp",
  Telefone: "Telefone",
  Email: "E-mail",
};

const ERRO_GENERICO =
  "Não conseguimos falar com o servidor. Tente novamente em instantes.";

type Estado = "idle" | "loading" | "success" | "error";

export function FormularioLead({
  modelo,
  modelos,
  onTrocarModelo,
}: {
  modelo: ModeloComFoto;
  modelos: readonly ModeloComFoto[];
  /** Trocar o modelo aqui atualiza a vitrine ao lado — o estado é do pai. */
  onTrocarModelo: (nome: string) => void;
}) {
  const id = useId();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [unidade, setUnidade] = useState<Unidade>("Teresina");
  const [canalPreferido, setCanalPreferido] = useState<CanalContato>("WhatsApp");
  const [consentimento, setConsentimento] = useState(false);

  const [estado, setEstado] = useState<Estado>("idle");
  const [erros, setErros] = useState<ErrosDeCampo>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [protocolo, setProtocolo] = useState("");

  const enviando = estado === "loading";

  /**
   * Some com o erro do campo assim que a pessoa mexe nele. Sem isso, a
   * mensagem fica na tela contradizendo o que já foi corrigido, até o
   * próximo envio.
   */
  function limparErro(campo: keyof ErrosDeCampo) {
    setErros((atuais) => {
      if (!atuais[campo]) return atuais;
      const resto = { ...atuais };
      delete resto[campo];
      return resto;
    });
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;

    const payload = {
      nome,
      whatsapp,
      modeloInteresse: modelo.nome,
      unidade,
      canalPreferido,
      consentimento,
    };

    const validado = novoLeadSchema.safeParse(payload);

    if (!validado.success) {
      setErros(errosDe(validado.error));
      setErroGeral(null);
      setEstado("error");
      return;
    }

    setEstado("loading");
    setErros({});
    setErroGeral(null);

    try {
      const resposta = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const corpo = await resposta.json();

      if (!resposta.ok) {
        setErros(corpo.erros ?? {});
        setErroGeral(corpo.erros ? null : ERRO_GENERICO);
        setEstado("error");
        return;
      }

      setProtocolo(corpo.protocolo);
      setEstado("success");
    } catch {
      setErroGeral(ERRO_GENERICO);
      setEstado("error");
    }
  }

  if (estado === "success") {
    return (
      <Confirmacao
        protocolo={protocolo}
        unidade={unidade}
        modelo={modelo.nome}
        canal={ROTULO_CANAL[canalPreferido]}
      />
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-[22px]">
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em]">
          Estou interessado
        </h2>
        <p className="text-sm leading-relaxed text-neutral-800">
          Preencha e um especialista da unidade escolhida entra em contato pelo
          WhatsApp.
        </p>
        <hr className="border-t border-neutral-300" />
      </div>

      {estado === "error" && (
        <div className="border-l-[3px] border-accent bg-accent-100 px-4 py-3.5">
          <p className="text-sm font-extrabold text-accent-700">
            Não foi possível enviar
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-accent-800">
            {erroGeral ?? "Revise os campos marcados abaixo e tente novamente."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-nome`} erro={!!erros.nome}>
          Nome
        </Label>
        <Input
          id={`${id}-nome`}
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            limparErro("nome");
          }}
          placeholder="Seu nome completo"
          erro={!!erros.nome}
          readOnly={enviando}
          autoComplete="name"
        />
        {erros.nome && <MensagemErro>{erros.nome}</MensagemErro>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-whatsapp`} erro={!!erros.whatsapp}>
          WhatsApp
        </Label>
        <Input
          id={`${id}-whatsapp`}
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(formatarWhatsapp(e.target.value));
            limparErro("whatsapp");
          }}
          placeholder="(86) 90000-0000"
          erro={!!erros.whatsapp}
          readOnly={enviando}
          inputMode="tel"
          autoComplete="tel"
        />
        {erros.whatsapp ? (
          <MensagemErro>{erros.whatsapp}</MensagemErro>
        ) : (
          <Hint>DDD + número. É por aqui que o contato acontece.</Hint>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-modelo`} erro={!!erros.modeloInteresse}>
          Modelo de interesse
        </Label>
        <Select
          id={`${id}-modelo`}
          value={modelo.nome}
          onChange={(e) => onTrocarModelo(e.target.value)}
          erro={!!erros.modeloInteresse}
          disabled={enviando}
        >
          {modelos.map((m) => (
            <option key={m.slug} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </Select>
        {erros.modeloInteresse && (
          <MensagemErro>{erros.modeloInteresse}</MensagemErro>
        )}
      </div>

      <fieldset className="flex flex-col gap-2" disabled={enviando}>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
          Unidade
        </legend>
        <div className="flex gap-2">
          {UNIDADES.map((u) => (
            <Chip
              key={u}
              ativo={unidade === u}
              onClick={() => setUnidade(u)}
            >
              {u}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={enviando}>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
          Prefiro ser contatado por
        </legend>
        <div className="flex gap-2">
          {CANAIS.map((c) => (
            <Chip
              key={c}
              ativo={canalPreferido === c}
              onClick={() => setCanalPreferido(c)}
            >
              {ROTULO_CANAL[c]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-neutral-800">
          <input
            type="checkbox"
            checked={consentimento}
            onChange={(e) => {
              setConsentimento(e.target.checked);
              limparErro("consentimento");
            }}
            disabled={enviando}
            className="mt-0.5 size-[18px] shrink-0 accent-accent"
          />
          Autorizo o uso dos meus dados para contato comercial sobre este modelo.
        </label>
        {erros.consentimento && <MensagemErro>{erros.consentimento}</MensagemErro>}
      </div>

      {/*
       * O design mobile põe este CTA numa faixa fixa no rodapé. Preso ali, ele
       * cobre o campo em foco enquanto a pessoa preenche — o protótipo não
       * mostra isso porque é estático. Fica no fluxo, ao fim do formulário.
       */}
      <BotaoPrimario type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <Spinner />
            Enviando
          </>
        ) : (
          "Quero falar com um especialista"
        )}
      </BotaoPrimario>

      <Hint>
        {enviando
          ? "Campos bloqueados durante o envio."
          : "Resposta em até 1 dia útil. Sem custo e sem compromisso."}
      </Hint>
    </form>
  );
}

function Confirmacao({
  protocolo,
  unidade,
  modelo,
  canal,
}: {
  protocolo: string;
  unidade: Unidade;
  modelo: string;
  canal: string;
}) {
  // `overflow-hidden` no card é o que faz a faixa vermelha respeitar o raio.
  return (
    <div className="overflow-hidden rounded-[4px] border border-neutral-300 bg-white">
      <div className="bg-accent px-6 py-7 text-bg">
        <MicroLabel className="text-bg/70">Estou interessado</MicroLabel>
        <h2 className="mt-2 text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em]">
          Interesse registrado
        </h2>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <p className="text-sm leading-relaxed text-neutral-800">
          Recebemos seu contato. Um especialista da unidade{" "}
          <strong>{unidade}</strong> fala com você pelo WhatsApp em até 1 dia
          útil.
        </p>

        <dl className="border-y border-neutral-300">
          {[
            ["Protocolo", `#${protocolo}`],
            ["Modelo", modelo],
            ["Contato por", canal],
          ].map(([rotulo, valor], indice) => (
            <div
              key={rotulo}
              className={`flex items-center justify-between gap-4 py-3.5 ${
                indice > 0 ? "border-t border-neutral-300" : ""
              }`}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600">
                {rotulo}
              </dt>
              <dd className="text-sm font-bold">{valor}</dd>
            </div>
          ))}
        </dl>

        <Link href="/">
          <BotaoSecundario>Ver outros modelos</BotaoSecundario>
        </Link>
      </div>
    </div>
  );
}
