import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Dentro de um container, `localhost` é o próprio container, sem banco. Se a
// variável não chegou até aqui, o container foi criado por uma versão antiga
// do docker-compose.yml — cair no fallback só trocaria esta explicação por
// 35 falhas de "Can't reach database server at localhost:5432".
if (!process.env.TEST_DATABASE_URL && existsSync("/.dockerenv")) {
  throw new Error(
    "TEST_DATABASE_URL não está definida neste container: ele foi criado por " +
      "uma versão anterior do projeto. Recrie-o com `docker compose up --build` " +
      "e rode os testes de novo.",
  );
}

// Schema separado no mesmo Postgres do Compose: os testes apagam tabelas
// entre si e não podem esbarrar nos dados de desenvolvimento.
const URL_TESTE =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/crm_leads?schema=test";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    env: { DATABASE_URL: URL_TESTE },
    // Os testes de integração compartilham o mesmo schema; paralelizar
    // arquivos faria um deleteMany derrubar os dados do outro.
    fileParallelism: false,
  },
});
