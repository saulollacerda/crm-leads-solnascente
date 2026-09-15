/**
 * Nome único e só com letras: o schema recusa dígitos, então a marca de
 * unicidade vem do timestamp traduzido para letras.
 */
export function nomeUnico(prefixo: string): string {
  const codigo = String(Date.now())
    .split("")
    .map((digito) => "abcdefghij"[Number(digito)])
    .join("");

  return `${prefixo} ${codigo}`;
}
