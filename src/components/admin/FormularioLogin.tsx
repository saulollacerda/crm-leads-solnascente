"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import {
  BotaoPrimario,
  Input,
  Label,
  MicroLabel,
  Hint,
  Spinner,
} from "@/components/ui/campos";

export function FormularioLogin({ destino }: { destino: string }) {
  const id = useId();
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      if (!resposta.ok) {
        setErro("Usuário ou senha incorretos.");
        setEnviando(false);
        return;
      }

      router.replace(destino);
      router.refresh();
    } catch {
      setErro("Não foi possível entrar. Tente novamente em instantes.");
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={entrar}
      noValidate
      className="w-full max-w-[440px] border border-text bg-white p-10"
    >
      <MicroLabel className="text-accent">Painel interno</MicroLabel>

      <h1 className="mt-2 text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em]">
        Entrar
      </h1>

      <hr className="my-6 border-t border-neutral-300" />

      {erro && (
        <div
          role="alert"
          className="mb-6 border-l-[3px] border-accent bg-accent-100 px-4 py-3.5"
        >
          <p className="text-sm font-extrabold text-accent-700">
            Não foi possível entrar
          </p>
          <p className="mt-1 text-[13px] text-accent-800">{erro}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-usuario`}>Usuário</Label>
          <Input
            id={`${id}-usuario`}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            readOnly={enviando}
            className="h-[50px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-senha`}>Senha</Label>
          <Input
            id={`${id}-senha`}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            readOnly={enviando}
            className="h-[50px]"
          />
        </div>

        <BotaoPrimario type="submit" disabled={enviando}>
          {enviando ? (
            <>
              <Spinner />
              Entrando
            </>
          ) : (
            "Entrar no painel"
          )}
        </BotaoPrimario>

        <Hint>Acesso restrito à equipe comercial.</Hint>
      </div>
    </form>
  );
}
