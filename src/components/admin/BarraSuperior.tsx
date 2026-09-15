"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Spinner } from "@/components/ui/campos";

export function BarraSuperior({
  usuario,
  logo,
}: {
  usuario: string;
  logo: string | null;
}) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;

    // Não volta a `false` no caminho feliz: a navegação encerra a página, e
    // reabilitar o botão só daria chance de um segundo clique inútil.
    setSaindo(true);

    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setSaindo(false);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-text px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Logo src={logo} escuro />
        <span className="hidden h-5 w-px bg-neutral-700 sm:block" />
        <span className="hidden text-[13px] text-neutral-400 sm:block">
          CRM de leads
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-[13px] text-neutral-400 sm:block">
          {usuario}@solnascente
        </span>
        <button
          onClick={sair}
          disabled={saindo}
          className="flex items-center gap-2 rounded-[4px] border border-neutral-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-bg transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          {saindo && <Spinner />}
          {saindo ? "Saindo" : "Sair"}
        </button>
      </div>
    </header>
  );
}
