import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export function MicroLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 ${className}`}
    >
      {children}
    </span>
  );
}

export function Label({
  children,
  erro = false,
  htmlFor,
}: {
  children: ReactNode;
  erro?: boolean;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs ${
        erro ? "text-accent-700" : "text-text"
      }`}
    >
      {children}
    </label>
  );
}

const CAMPO_BASE =
  "h-12 w-full rounded-[4px] border bg-white px-3.5 text-base outline-none placeholder:text-neutral-500 sm:text-[15px]";

export function Input({
  erro,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { erro?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={erro || undefined}
      className={`${CAMPO_BASE} ${erro ? "border-accent" : "border-text"} ${className}`}
    />
  );
}

export function Select({
  erro,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { erro?: boolean }) {
  return (
    <select
      {...props}
      aria-invalid={erro || undefined}
      className={`${CAMPO_BASE} appearance-none ${
        erro ? "border-accent" : "border-text"
      } ${className}`}
    >
      {children}
    </select>
  );
}

export function MensagemErro({ children }: { children: ReactNode }) {
  return <p className="text-xs text-accent-700">{children}</p>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-[11px] leading-relaxed text-neutral-700">{children}</p>;
}

export function Chip({
  ativo,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  ativo: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      {...props}
      className={`h-[46px] flex-1 rounded-[4px] border text-[13px] font-extrabold uppercase tracking-[0.04em] transition-colors ${
        ativo
          ? "border-accent bg-accent text-bg"
          : "border-text bg-white text-text hover:bg-accent-100"
      }`}
    >
      {children}
    </button>
  );
}

export function BotaoPrimario({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={`flex h-[52px] w-full items-center gap-2.5 rounded-[4px] bg-accent px-[18px] text-left text-[15px] font-extrabold uppercase tracking-[0.04em] text-bg transition-colors hover:bg-accent-600 active:bg-accent-700 disabled:opacity-45 ${className}`}
    >
      {children}
    </button>
  );
}

export function BotaoSecundario({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={`flex h-12 w-full items-center rounded-[4px] border border-text bg-white px-[18px] text-left text-[13px] font-extrabold uppercase tracking-[0.04em] text-text transition-colors hover:bg-accent-100 ${className}`}
    >
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-4 animate-spin rounded-full border-2 border-bg border-t-transparent"
    />
  );
}
