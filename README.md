# CRM Leads Sol Nascente Motos

Mini CRM de captação e gestão de leads para a **Sol Nascente Motos** (concessionária Honda — unidades Teresina e Timon): uma landing pública com formulário de captação, uma API de leads e um painel administrativo com controle de status.


> ⚠️ **Os preços e parcelas exibidos são ilustrativos.** Nenhum valor foi confirmado
> pela concessionária e nenhum constitui oferta comercial: existem apenas para dar
> corpo à demonstração, enquanto o catálogo de modelos não vem do estoque real. O
> mesmo vale para o catálogo em si — os modelos listados não refletem disponibilidade.

## O que está pronto

| Superfície | O que faz |
|---|---|
| Landing `/` | Redireciona para a página do modelo em destaque |
| `/modelos/[slug]` | Vitrine do modelo + formulário de captação (nome, WhatsApp, modelo, unidade, canal preferido, consentimento LGPD) |
| `/admin` | Painel de leads com filtros por unidade e status, e avanço de status por lead |
| `/admin/login` | Login do administrador (usuário e senha) |
| API | Criar lead (pública), listar e atualizar status (autenticadas) |

Cada lead recebe um **protocolo** (`SN-2026-0001`) gerado por sequência do Postgres, exibido ao cliente no sucesso do envio e no painel — é a referência que ele usa no atendimento.

## Rodar localmente

**Pré-requisitos:** Docker (com Compose) e Node.js 20+.

```bash
cp .env.example .env
docker compose up --build
```

Sobe dois containers: a aplicação Next.js em `http://localhost:3000` e o Postgres em `localhost:5432`.

Na primeira vez (ou depois de alterar `prisma/schema.prisma`), com o banco no ar, aplique as migrations a partir da máquina:

```bash
npm install          # só na primeira vez, para ter o CLI do Prisma na máquina
npx prisma migrate dev
```

O `DATABASE_URL` do `.env` aponta para `localhost`, então `prisma` e os testes rodam direto na máquina; o container `app` recebe o hostname interno `db` por override no `docker-compose.yml`.

O client do Prisma é gerado dentro do container a cada start, num diretório fora do bind mount: o engine é específico do sistema operacional, e o que o `prisma generate` do host produz (macOS ou Windows) não roda no container.

Para entrar no painel, use `ADMIN_USERNAME` / `ADMIN_PASSWORD` do `.env` (por padrão `admin` / `changeme`) em `http://localhost:3000/admin`.

### Sem Docker para a aplicação

Se preferir rodar o Next na máquina e usar o Docker só para o banco:

```bash
docker compose up -d db
npm install
npx prisma migrate dev
npm run dev
```

### Testes

```bash
npm test          # unidade + integração (Vitest) — 169 testes
npm run test:e2e  # fluxos ponta a ponta (Playwright, desktop e mobile)
```

Os testes de integração usam o schema `test` do mesmo Postgres, isolado dos dados de desenvolvimento. Na primeira vez, e sempre que criar uma migration, aplique-a lá também — **as duas variáveis**, porque o `migrate` usa a `DIRECT_URL`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_leads?schema=test" \
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/crm_leads?schema=test" \
npx prisma migrate deploy
```

Antes do primeiro `test:e2e`, instale o navegador do Playwright (uma vez por máquina):

```bash
npx playwright install chromium
```

O Playwright sobe o `npm run dev` sozinho; para apontar para outro ambiente, use `E2E_BASE_URL`.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Postgres da aplicação (container em dev, pooler do Supabase em produção) |
| `DIRECT_URL` | Conexão direta, usada só pelas migrations (em dev, igual à de cima) |
| `ADMIN_USERNAME` | Usuário do painel admin |
| `ADMIN_PASSWORD` | Senha do painel admin |
| `SESSION_SECRET` | Segredo que assina o cookie de sessão. Em produção, gerar um novo — nunca reaproveitar o do `.env` local |

## API

| Método | Rota | Acesso | Respostas |
|---|---|---|---|
| `POST` | `/api/leads` | Pública | `201` com `id` e `protocolo`; `422` com erros por campo |
| `GET` | `/api/leads?unidade=&status=` | Sessão | `200` com a lista; `401` sem sessão |
| `PATCH` | `/api/leads/[id]/status` | Sessão | `200`; `409` em transição inválida; `404`; `401` |
| `POST` / `DELETE` | `/api/auth/session` | — | Login (emite o cookie) e logout |

## Estrutura

```
src/app/(public)/       # landing e páginas de modelo
src/app/admin/          # painel e login
src/app/api/            # rotas de API
src/components/         # componentes por superfície (publico, admin, ui)
src/lib/                # regras de negócio: leads, auth, catálogo, formatação
src/proxy.ts            # guarda das páginas /admin (o middleware do Next 16)
prisma/                 # schema e migrations
tests/e2e/              # fluxos ponta a ponta
```

---

# Decisões técnicas

O contexto de toda decisão abaixo é o mesmo: **teste técnico com prazo de 48 horas**. Quase todas são uma escolha entre o que seria certo para um produto de longo prazo e o que entrega algo confiável no prazo — quando as duas divergem, o caminho de evolução está em [O que faria para produção](#o-que-faria-para-produção).

A primeira é uma decisão de processo, não de stack, e é a que sustenta as outras: **o sistema todo foi desenvolvido em TDD**. Várias decisões adiante — a invariante do status no banco, a máquina de estados no servidor, a validação do formulário — só puderam ser tomadas com confiança porque o teste veio antes.

### TDD em todo o sistema (Vitest, Testing Library e Playwright)

Ciclo **red-green-refactor**: o teste que falha vem antes da implementação, e nenhuma funcionalidade — rota de API, validação, regra de negócio, componente com lógica — entra sem um teste que a cubra, escrito antes ou junto. Bug corrigido ganha primeiro um teste de regressão que reproduz o problema, depois o fix.

A divisão de trabalho entre as ferramentas:

| Ferramenta | Cobre |
|---|---|
| **Vitest** | Lógica pura (validação, máquina de estados, formatação) e integração com o banco via Prisma, incluindo os handlers de API |
| **Testing Library** | Componentes com lógica não trivial — o formulário público e o painel de leads |
| **Playwright** | Os fluxos críticos ponta a ponta, em desktop e mobile: captação, login e avanço de status |

Hoje são **169 testes de unidade e integração** em 14 arquivos, mais **20 testes E2E** (10 cenários rodados nos dois perfis). Os testes ficam junto do código (`*.test.ts` / `*.test.tsx`), exceto os E2E, em `tests/e2e/`. Os de integração rodam contra o schema `test` do Postgres local — nunca contra produção.

**Por quê:** prazo curto com retrabalho é o cenário clássico de regressão despercebida, e as regras que mais importam aqui são lógica pura, barata de testar. Ter as regras cobertas antes da UI existir é o que permitiu refatorar um visual high-fidelity sem medo, e é o que torna verificáveis as invariantes das decisões seguintes.

**Por quê não Jest:** exige configuração extra de ESM e TypeScript num projeto Vite-adjacente; o Vitest roda com a configuração que o projeto já tem.

**Custo:** tempo de setup e a disciplina de escrever o teste antes — pago de volta na primeira regressão evitada.

### Monolito Next.js (App Router) para landing, painel e API

Um único projeto e um único deploy servem as três superfícies. Front separado mais API Node dedicada dobraria deploys e exigiria CORS, autenticação cross-origin e duplicação de tipos — custo real sem benefício para quatro endpoints e cinco telas.

**Custo:** a API fica presa ao ciclo de vida do front. Para manter a saída barata, a regra de negócio nasce em módulos próprios (`src/lib/`) e os route handlers são casca fina sobre eles.

### Supabase como Postgres gerenciado — e nada mais

O acesso a dados passa só por `DATABASE_URL` + Prisma. Nenhuma dependência de `@supabase/*`: sem SDK, sem PostgREST, sem Supabase Auth.

**Por quê:** usar o SDK amarraria modelo de dados, autorização e código a um fornecedor. Do jeito que está, migrar para Neon, RDS ou um Postgres em container é trocar uma variável de ambiente — o mesmo schema e as mesmas migrations continuam valendo. O free tier foi o critério de escolha entre Supabase, Neon e Railway, que são equivalentes tecnicamente.

**Custo:** abre mão de funcionalidades prontas (auth, storage, realtime), e o free tier pausa o projeto após inatividade longa.

### Deploy na Vercel, Docker Compose só em desenvolvimento

A Vercel dá HTTPS, CDN e preview por branch sem configuração. O Compose existe para que o ambiente local suba em um comando, com banco descartável e sem instalar Postgres na máquina — mas não vai para produção.

**Custo:** assimetria dev/prod (container local, serverless em produção) e trabalho em background que não pode rodar dentro da requisição. A fronteira entre os dois ambientes é só o Prisma, o que mantém a assimetria administrável.

### Status inicial garantido pelo banco, não pela aplicação

"Todo lead nasce como `Novo`" é a invariante de entrada do funil. Ela vive no `@default(Novo)` do schema, e o endpoint público simplesmente não aceita `status` no payload — quem enviar é ignorado, não obedecido.

**Por quê:** definir o status na camada de serviço valeria só enquanto todo mundo passasse por esse caminho; seed, importação e a futura integração de estoque ficariam livres para violá-la.

**Como fica verificável:** dois testes fixam a invariante — um cobre o lead nascendo `Novo` (`src/lib/leads/repositorio.test.ts`), outro cobre a tentativa de injetar `status` no payload, que é ignorada (`src/app/api/leads/route.test.ts`).

### Transição de status validada no servidor como máquina de estados

`Novo → EmContato → Convertido | Perdido`, com os dois últimos finais. A decisão é uma função pura consultada pelo `PATCH`, que recusa transição inválida com `409`. O painel esconder o botão inválido é conveniência de interface, não o mecanismo de garantia.

**Por quê:** "autenticado" não é "correto" — um clique duplo, uma aba velha com estado defasado ou um `curl` bastam para mover um lead de `Novo` direto para `Convertido` e corromper a leitura do funil.

**Como fica verificável:** ser uma função pura é o que torna a tabela de transições testável sem banco e sem HTTP — foi a primeira coisa escrita, antes do handler e antes do painel. O `409` de transição inválida tem teste no handler, e o caminho completo até `Convertido` tem teste E2E.

### Autenticação por credencial em env var + JWT em cookie httpOnly

Sem tabela de usuários: `ADMIN_USERNAME` / `ADMIN_PASSWORD` validam o login, que emite um JWT assinado com `SESSION_SECRET` (via `jose`, que roda no edge) em cookie `httpOnly`, `Secure` e `SameSite=Lax`.

São **duas guardas, uma por superfície**: `src/proxy.ts` protege as páginas de `/admin/*` com redirect para o login; as rotas de API verificam a sessão no próprio handler e respondem `401` em JSON. A API não depende de o matcher continuar correto.

**Por quê não NextAuth:** dependência e modelo mental grandes para autenticar um único usuário, que é exatamente o escopo que o PRD definiu para a v1. Token em `localStorage` foi descartado por ficar legível a qualquer XSS.

**Custo:** trocar a senha exige redeploy, não há trilha de auditoria por pessoa e não há revogação de sessão individual. Adequado para uma equipe de duas unidades compartilhando um acesso; com mais vendedores, o caminho é uma tabela de usuários com papéis.

### Painel em `/admin` (path-based), não em subdomínio

Subdomínio seria preferível — isola o cookie por origem —, mas depende de um domínio que o projeto ainda não tem. Criar a separação só quando houver domínio evita configurar hoje algo que seria refeito.

**Custo:** o cookie compartilha origem com a página pública, o que aumenta o impacto de um eventual XSS na landing. A mitigação de hoje é o `httpOnly`.

### Catálogo de modelos estático, atrás de um contrato de leitura

Os dados dos modelos são estáticos em `src/lib/modelos/dados.ts`, mas as telas só os acessam por `listarModelos()` / `buscarModelo(slug)`. Uma tabela `Modelo` com CRUD seria um sistema de catálogo — escopo que o PRD não pede e que a integração com o estoque jogaria fora.

**Por quê a indireção:** importar o array direto nos componentes seria mais simples hoje e transformaria a integração futura em uma refatoração espalhada pela UI. Assim, trocar a fonte é reimplementar uma função.

### Tokens de design no `@theme` do Tailwind, não valores literais

Cores, tipografia e escalas do handoff ficam registradas como tokens em `src/app/globals.css`; nenhum hex literal no JSX. Escrever `bg-[#cc0000]` é mais rápido no primeiro componente e insustentável no quinto — impede responder "onde usamos o vermelho da marca" e garante divergência quando um valor mudar.

### Consentimento LGPD com data e versão

Nome e telefone de alguém interessado em comprar são dado pessoal com finalidade comercial explícita. O aceite é obrigatório (sem ele o lead não é gravado) e fica registrado como `consentimentoEm` + `consentimentoVersao`, não como um booleano: quando o texto mudar, a versão é o que permite saber quem aceitou o quê.

### Protocolo gerado por sequência do Postgres

`SN-2026-0001` vem de um `DEFAULT` no banco usando `nextval`, não da aplicação. É único por construção e vale para qualquer origem de escrita — mesma lógica do status inicial.

### Campo `canalPreferido`, divergindo do PRD

O design final inclui "Prefiro ser contatado por" (WhatsApp / Telefone / E-mail), que o modelo de dados do PRD não previa. O campo foi adicionado por migration, com default `WhatsApp`. Implementar o seletor sem persistir entregaria a tela fiel ao design e um dado perdido no envio — pior do que não ter o campo.

---

# O que faria para produção

O que existe hoje atende ao PRD e ao prazo. Abaixo, só o essencial: as cinco mudanças que separam a demonstração de um sistema que a concessionária usa no dia a dia.

### 1. Domínio próprio

- Apontar um domínio da empresa (ex.: `crm.solnascentemotos.com.br`) para a Vercel, com SSL automático. A URL gerada pela plataforma serve para avaliação e é ruim para um link que vai em anúncio e conversa de WhatsApp.
- Com o domínio, o painel vai para subdomínio próprio (`admin.`): o cookie de sessão fica isolado por origem, resolvendo o custo registrado na decisão do [painel em `/admin`](#painel-em-admin-path-based-não-em-subdomínio).

### 2. Pipeline de CI/CD

- **CI a cada pull request** (GitHub Actions): lint, checagem de tipos, `npm test` contra um Postgres em container do próprio pipeline e `npm run test:e2e`. Merge só com tudo verde — a suíte do TDD já existe, falta torná-la obrigatória.
- **CD pela Vercel**: preview automático por PR e produção só a partir da `main` aprovada.
- **Migrations dentro do pipeline**: `prisma migrate deploy` como etapa antes do deploy, primeiro num staging com banco próprio. Nunca migration aplicada à mão em produção.

### 3. Preços e imagens reais, vindos do estoque

- **Bloqueante para uso real:** os preços e parcelas de hoje são ilustrativos. Publicar preço errado de moto é problema comercial e jurídico, não detalhe de conteúdo.
- Sincronização com o ERP/DMS da concessionária — modelos, preços, parcelas, disponibilidade e fotos por modelo e cor — por job periódico com cache. Estoque de motos não muda por minuto.
- O ponto de troca já existe: as telas só leem o catálogo por `listarModelos()` / `buscarModelo(slug)`, então muda a implementação dessas funções e nenhuma tela.
- Com o catálogo real, `modeloInteresse` deixa de ser texto e passa a referenciar um `modeloId`. É o que torna confiável qualquer relatório por modelo.

### 4. Separação em dois serviços: backend e frontend

- **Backend Node.js dedicado** (Fastify ou NestJS), dono do Prisma, do schema e das regras de negócio, expondo a API. O Next.js fica só com a apresentação — landing e painel — consumindo essa API.
- **O que destrava:** um processo de longa duração comporta o que o serverless não comporta bem — worker de fila para o WhatsApp e o chatbot, job de sincronização do estoque, conexão persistente com o banco — e abre a API para outros consumidores.
- **O que passa a custar:** CORS e autenticação entre domínios, contrato de tipos explícito (OpenAPI ou pacote compartilhado) e dois deploys.
- **Quando fazer:** junto com o item 5, que é o primeiro processamento assíncrono. Antes disso é custo sem retorno. A extração é barata porque a regra de negócio já vive em `src/lib/` e os route handlers são casca fina.

### 5. Integração com WhatsApp e qualificação por chatbot

O canal real da concessionária é o WhatsApp, e hoje o primeiro contato é inteiramente manual. A proposta é automatizar do interesse até a proposta, deixando para o vendedor a fila já ordenada por quem está pronto para comprar:

![Fluxo de qualificação: o cliente envia o interesse, a automação envia mensagem pelo WhatsApp, o chatbot faz perguntas e classifica o lead como quente, morno ou frio, o resultado é gravado na base de dados e vira uma proposta personalizada](docs/img/fluxo-qualificacao-whatsapp.svg)

1. **O cliente envia o interesse** pelo formulário — é o que já existe hoje.
2. **A automação envia a mensagem** pela Meta WhatsApp Cloud API, com template aprovado, e avisa o vendedor da unidade. O envio vai para uma **fila com retry**, nunca dentro do `POST /api/leads`: um timeout da Meta não pode virar lead perdido.
3. **O chatbot faz as perguntas** que o vendedor faria na primeira ligação: prazo de compra, forma de pagamento, entrada, moto na troca e CNH. Ele se identifica como bot, e qualquer dúvida fora do roteiro passa a conversa para um humano.
4. **O lead é classificado** por temperatura:

   | Temperatura | Critério inicial |
   |---|---|
   | **Quente** | Compra em até 30 dias, com forma de pagamento definida |
   | **Morno** | Compra em 1 a 3 meses, ou pagamento ainda indefinido |
   | **Frio** | Sem prazo definido, só pesquisando |

5. **O resultado vai para a base de dados** como campos estruturados do lead, não como texto — é o que permite ordenar a fila, filtrar o painel e medir conversão por faixa.
6. **Sai a proposta completa e personalizada**, com preço, entrada e parcelas vindos do estoque (item 3), nunca gerados pelo bot. O vendedor revisa antes de enviar.

Duas condições para ligar isso com lead real:

- **LGPD:** o consentimento atual autoriza "contato comercial", o que não cobre classificação automatizada. É preciso um novo texto e um novo aceite — o sistema já grava a versão aceita justamente para isso. O `canalPreferido` também passa a valer: quem escolheu telefone ou e-mail não recebe automação de WhatsApp.
- **Medir antes de confiar:** comparar a conversão da fila ordenada por temperatura com a da ordem de chegada. Se a classificação não melhorar a conversão, ela só adiciona uma camada de erro entre o lead e o vendedor.
