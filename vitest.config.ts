import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

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
