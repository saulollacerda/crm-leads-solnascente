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

## Modelo de dados

Model `Lead` (ver `prisma/schema.prisma`): `id` (uuid), `nome`, `whatsapp`, `modeloInteresse`, `unidade` (enum `Teresina` | `Timon`), `status` (enum `Novo` | `EmContato` | `Convertido` | `Perdido`, default `Novo`), `createdAt`, `updatedAt`.

## Autenticação do admin

Login simples: credenciais fixas via env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`), sem tabela de usuários. Sessão via cookie **httpOnly** assinado (JWT com `SESSION_SECRET`). Middleware protege tudo em `/admin/*` exceto `/admin/login`, e as rotas de API de listagem/atualização de status.

## Desenvolvimento local

```bash
cp .env.example .env
docker compose up --build
```

- App em `http://localhost:3000`, Postgres também exposto em `localhost:5432` (para inspeção com um client externo).
- Primeira vez (ou após alterar `schema.prisma`): `docker compose exec app npx prisma migrate dev`. Roda dentro do container `app` porque `DATABASE_URL` usa o hostname interno `db` da rede do Compose.

## Produção

Deploy do app no Vercel. `DATABASE_URL` nas env vars do Vercel apontando para o Postgres do Supabase. Ao aplicar migrations em produção: `npx prisma migrate deploy`.

## Variáveis de ambiente

| Variável         | Uso                                                        |
|------------------|-------------------------------------------------------------|
| `DATABASE_URL`   | Connection string do Postgres (container em dev, Supabase em prod) |
| `ADMIN_USERNAME` | Usuário do painel admin                                     |
| `ADMIN_PASSWORD` | Senha do painel admin                                       |
| `SESSION_SECRET` | Segredo para assinar o cookie de sessão do admin             |

## Convenções

- TypeScript estrito, App Router, `src/` como raiz do código-fonte, alias `@/*`.
- Tailwind para toda a estilização — evitar CSS solto/módulos CSS paralelos.
- Migrations do Prisma são a única forma de alterar o schema do banco (nunca alterar tabelas manualmente em produção).
