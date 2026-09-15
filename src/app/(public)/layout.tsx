import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { logoOficial } from "@/lib/marca";

export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex h-14 items-center justify-center border-b border-text px-4 sm:h-[72px] sm:px-10">
        <Link href="/" className="flex items-center">
          <Logo src={logoOficial(false)} />
        </Link>
      </header>

      <main className="flex-1">{children}</main>
    </>
  );
}
