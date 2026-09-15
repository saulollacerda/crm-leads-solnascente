# CRM Leads Sol Nascente Motos

Mini CRM de captação e gestão de leads para a Sol Nascente Motos (concessionária Honda, unidades Teresina e Timon): formulário público de captação, API de leads e painel administrativo com controle de status. Descrição completa do produto em [`docs/PRD.md`](docs/PRD.md).

## Stack

- **Next.js** (App Router, TypeScript) — landing pública, painel admin e API routes num único projeto/deploy.
- **Tailwind CSS** — estilização responsiva rápida.
- **Prisma** + **Postgres** — camada de dados tipada, com migrations versionadas.
- **Docker Compose** — isola o ambiente de desenvolvimento local (app + Postgres em container). Não é usado em produção.
- **Vercel** (produção do app) + **Supabase** (Postgres gerenciado em produção).

Justificativa: um único repositório cobre front e back, reduzindo a complexidade dado o prazo de 48h. O acesso a dados é só via `DATABASE_URL` (Postgres puro) — em dev aponta para o container local, em produção para a connection string do Supabase. Isso evita acoplar o código ao SDK/REST do Supabase; ele é usado apenas como Postgres gerenciado.

## Arquitetura

```
src/app/(public)/      # landing pública com o formulário de captação
src/app/admin/         # painel administrativo (rotas protegidas por middleware)
src/app/admin/login/   # login do admin (rota pública dentro de /admin)
src/app/api/leads/     # API: criar lead (POST, pública) e listar (GET, autenticado)
src/app/api/leads/[id]/status/  # API: atualizar status do lead (autenticado)
prisma/schema.prisma   # modelo Lead
```

Admin fica em `/admin` (path-based), não em subdomínio — não há domínio próprio configurado para o projeto.

## Catálogo de modelos

Os modelos ficam em `src/lib/modelos/dados.ts`, acessados só pelo contrato de leitura em `catalogo.ts`. **Preços e parcelas são ilustrativos** — nenhum valor foi confirmado pela concessionária e nenhum constitui oferta comercial. Trocar por valores oficiais é pré-requisito de qualquer uso com público real; a fonte definitiva será o estoque da empresa.

## Modelo de dados

Model `Lead` (ver `prisma/schema.prisma`): `id` (uuid), `nome`, `whatsapp`, `modeloInteresse`, `unidade` (enum `Teresina` | `Timon`), `status` (enum `Novo` | `EmContato` | `Convertido` | `Perdido`, default `Novo`), `createdAt`, `updatedAt`.

## Autenticação do admin

Login simples: credenciais fixas via env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`), sem tabela de usuários. Sessão via cookie **httpOnly** assinado (JWT com `SESSION_SECRET`, via `jose` — roda no edge).

Duas guardas, uma por superfície: o middleware protege as páginas de `/admin/*` (exceto `/admin/login`) com redirect para o login; as rotas de API verificam a sessão no próprio handler e respondem `401` em JSON. A API não depende do matcher do middleware continuar correto.

## Desenvolvimento local

```bash
cp .env.example .env
docker compose up --build
```

- App em `http://localhost:3000`, Postgres exposto em `localhost:5432`.
- O `DATABASE_URL` do `.env` aponta para `localhost`, então `prisma` e os testes rodam direto na máquina. O container `app` recebe o hostname interno `db` por override no `docker-compose.yml`.
- Primeira vez (ou após alterar `schema.prisma`): `npx prisma migrate dev`.

### Testes

```bash
npm test          # unidade + integração (Vitest)
npm run test:e2e  # fluxos ponta a ponta (Playwright)
```

Os testes de integração usam o schema `test` do mesmo Postgres — isolado dos dados de desenvolvimento. Ao criar uma migration, aplicá-la lá também:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_leads?schema=test" \
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/crm_leads?schema=test" \
npx prisma migrate deploy
```

As duas variáveis são necessárias: o `migrate` usa a `DIRECT_URL`, então sobrescrever só a `DATABASE_URL` aplicaria a migration no schema `public` de novo.

## Produção

Deploy do app no Vercel, Postgres no Supabase.

O Supabase expõe duas connection strings, e as duas são necessárias:

- **Pooler** (porta 6543, modo transação) → `DATABASE_URL`. É o que a aplicação usa: cada função serverless abre a própria conexão e o Postgres tem limite.
- **Direta** (porta 5432) → `DIRECT_URL`. Só as migrations usam, porque o pooler em modo transação não aceita os comandos de DDL do `migrate`.

Aplicar migrations em produção é passo explícito, não parte do build:

```bash
DATABASE_URL="<direta>" DIRECT_URL="<direta>" npx prisma migrate deploy
```

O `build` roda `prisma generate` antes do `next build`. Isso é obrigatório e não redundante: o client é gerado em `src/generated/prisma`, que não é versionado, e o `postinstall` do Prisma não roda quando a Vercel restaura `node_modules` do cache.

## Variáveis de ambiente

| Variável         | Uso                                                        |
|------------------|-------------------------------------------------------------|
| `DATABASE_URL`   | Postgres da aplicação (container em dev, pooler do Supabase em prod) |
| `DIRECT_URL`     | Conexão direta, usada só pelas migrations (em dev, igual à de cima) |
| `ADMIN_USERNAME` | Usuário do painel admin                                     |
| `ADMIN_PASSWORD` | Senha do painel admin                                       |
| `SESSION_SECRET` | Segredo para assinar o cookie de sessão do admin. Em produção, gerar um novo — nunca reaproveitar o do `.env` local |

## Convenções

- TypeScript estrito, App Router, `src/` como raiz do código-fonte, alias `@/*`.
- Tailwind para toda a estilização — evitar CSS solto/módulos CSS paralelos.
- Migrations do Prisma são a única forma de alterar o schema do banco (nunca alterar tabelas manualmente em produção).

## TDD (Test-Driven Development)

Todo o sistema é desenvolvido seguindo TDD, para garantir confiabilidade em um projeto com prazo curto e baixa margem para regressões.

- Ciclo **red-green-refactor**: escrever o teste que falha antes da implementação, implementar o mínimo para o teste passar, depois refatorar com os testes verdes.
- Nenhuma funcionalidade nova (rota de API, componente, validação, regra de negócio) é implementada sem um teste que a cubra escrito antes ou junto.
- Bugs corrigidos ganham um teste de regressão antes do fix, reproduzindo o problema.
- Stack de testes:
  - **Vitest** para testes unitários e de integração (lógica de validação, camada de dados via Prisma, handlers de API).
  - **Testing Library** (`@testing-library/react`) para componentes React quando houver lógica não-trivial de UI.
  - **Playwright** para testes end-to-end dos fluxos críticos (formulário público de captação, login admin, atualização de status de lead).
  - Testes de API/integração rodam contra o Postgres do Docker Compose local, nunca contra produção/Supabase.
- Organização: arquivos de teste colocados junto ao código (`*.test.ts`/`*.test.tsx`) ou em `tests/` para E2E.
- CI (quando configurado) deve rodar a suíte completa antes de qualquer merge/deploy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
