"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export function BarraSuperior({ usuario }: { usuario: string }) {
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-text px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Logo escuro />
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
          className="rounded-[4px] border border-neutral-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-bg transition-colors hover:bg-neutral-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
