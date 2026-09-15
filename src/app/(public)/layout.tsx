import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-text px-4 sm:h-[72px] sm:px-10">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] text-neutral-800 sm:flex">
          <span>Motos</span>
          <span>Consórcio</span>
          <span>Serviços</span>
          <span>Unidades</span>
        </nav>

        <div className="hidden text-right text-[11px] leading-tight text-neutral-700 sm:block">
          <p>Teresina · Timon</p>
          <p className="font-bold text-text">(86) 3221-0000</p>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </>
  );
}
