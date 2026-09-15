import type { Metadata } from "next";
import { FormularioLogin } from "@/components/admin/FormularioLogin";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Entrar — Painel Sol Nascente",
};

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ de?: string }>;
}) {
  const { de } = await searchParams;

  // Só caminho interno: um `de` vindo da URL não pode virar redirect para fora.
  const destino = de?.startsWith("/admin") ? de : "/admin";

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-20">
      <div className="absolute left-4 top-8 sm:left-14 sm:top-14">
        <Logo />
      </div>

      <FormularioLogin destino={destino} />
    </div>
  );
}
