/**
 * Comparação de tempo constante: o tempo de resposta do login não deve revelar
 * quantos caracteres da senha estavam certos.
 */
function iguaisEmTempoConstante(a: string, b: string): boolean {
  const bytesA = new TextEncoder().encode(a);
  const bytesB = new TextEncoder().encode(b);

  let diferenca = bytesA.length ^ bytesB.length;
  for (let i = 0; i < Math.max(bytesA.length, bytesB.length); i++) {
    diferenca |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  }

  return diferenca === 0;
}

export function credenciaisValidas(usuario: string, senha: string): boolean {
  const esperadoUsuario = process.env.ADMIN_USERNAME;
  const esperadoSenha = process.env.ADMIN_PASSWORD;

  if (!esperadoUsuario || !esperadoSenha) return false;

  const usuarioOk = iguaisEmTempoConstante(usuario, esperadoUsuario);
  const senhaOk = iguaisEmTempoConstante(senha, esperadoSenha);

  return usuarioOk && senhaOk;
}
