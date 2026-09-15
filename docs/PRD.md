# PRD — CRM de Leads Sol Nascente Motos

## 1. Contexto

A Sol Nascente Motos é uma concessionária Honda com duas unidades: **Teresina** e **Timon**. Hoje os leads interessados em motos chegam por canais informais (WhatsApp, indicação, balcão) sem um processo estruturado de captação e acompanhamento. Este projeto cria um **mini CRM de leads**: um formulário público para captar interesse e um painel interno para a equipe comercial acompanhar e converter esses leads.

Este documento descreve o produto na íntegra. Para as decisões técnicas de implementação, ver [`CLAUDE.md`](../CLAUDE.md) na raiz do repositório.

## 2. Objetivo

Permitir que qualquer visitante registre interesse em um modelo de moto em poucos segundos, e que a equipe da concessionária visualize, priorize e acompanhe esses leads até a conversão (venda) ou perda.

## 3. Público

- **Visitante / cliente em potencial** — usa o formulário público, majoritariamente pelo celular.
- **Equipe comercial / administrador** — usa o painel interno para gerenciar os leads recebidos.

## 4. Escopo funcional

### 4.1 Landing pública (formulário de captação)

- Formulário com os campos:
  - **Nome** (texto, obrigatório)
  - **WhatsApp** (telefone, obrigatório, com máscara/validação de formato brasileiro)
  - **Modelo de interesse** (seleção entre os modelos Honda disponíveis, obrigatório)
  - **Unidade** (Teresina ou Timon, obrigatório)
- Validação client-side e server-side de todos os campos antes de salvar.
- Feedback visual claro para os três estados da submissão: **carregando**, **sucesso** e **erro** (incluindo erros de validação por campo e erros de rede/servidor).
- Layout responsivo, com prioridade para a experiência em celular (é o canal esperado de maior acesso).

### 4.2 API

- **Criar lead**: recebe os dados do formulário, valida e persiste um novo lead com status inicial `Novo`.
- **Listar leads**: retorna os leads cadastrados para consumo do painel administrativo (com paginação/ordenação por data de criação, mais recentes primeiro).
- Endpoints protegidos adequadamente: criação de lead é pública (é o formulário do site); listagem e atualização de status exigem sessão de administrador autenticado.

### 4.3 Painel administrativo

- **Login simples** (usuário e senha) para acesso ao painel — sem cadastro público de novos administradores nesta v1.
- **Listagem de leads**: nome, WhatsApp, modelo de interesse, unidade, status atual e data de criação. Deve ser possível identificar rapidamente leads novos/pendentes de contato.
- **Alteração de status do lead**, seguindo o fluxo:

  ```
  Novo → Em contato → Convertido
                    ↘ Perdido
  ```

  - Todo lead nasce como `Novo`.
  - A partir de `Em contato`, o lead pode avançar para `Convertido` (venda realizada) ou `Perdido` (não avançou/desistiu).
  - A transição de status é uma ação manual do administrador a partir da listagem.
- Painel deve ser **usável no celular** — a equipe comercial pode precisar consultar/atualizar leads fora do escritório.

### 4.4 Deploy

- Aplicação publicada com **link acessível pela internet** — não pode ser apenas ambiente local.

### 4.5 Documentação

- README na raiz do repositório com: como rodar o projeto localmente, decisões técnicas tomadas, e o que seria feito de diferente/adicional para um cenário de produção real.

## 5. Modelo de dados (lead)

| Campo             | Tipo                                              | Observações                                  |
|-------------------|----------------------------------------------------|-----------------------------------------------|
| `id`              | UUID                                                | Chave primária                                |
| `nome`            | texto                                               | Obrigatório                                   |
| `whatsapp`        | texto                                               | Obrigatório, formato validado                 |
| `modeloInteresse` | texto                                               | Obrigatório                                   |
| `unidade`         | enum: `Teresina`, `Timon`                           | Obrigatório                                   |
| `status`          | enum: `Novo`, `EmContato`, `Convertido`, `Perdido` | Default `Novo`                                |
| `createdAt`       | timestamp                                           | Preenchido automaticamente na criação         |
| `updatedAt`       | timestamp                                           | Atualizado automaticamente a cada alteração   |

## 6. Requisitos não funcionais

- **Disponibilidade pública**: sistema acessível via link HTTPS, hospedado em serviço de nuvem.
- **Responsividade**: landing e painel devem funcionar bem em telas de celular (largura ~360-400px) e desktop.
- **Segurança básica do admin**: rotas do painel e da API de listagem/atualização não acessíveis sem autenticação; senha do admin não versionada em código-fonte.
- **Persistência confiável**: dados dos leads armazenados em banco relacional, não perdidos entre deploys.

## 7. Fora de escopo (v1)

- Múltiplos usuários administradores com papéis/permissões diferentes.
- Notificações automáticas (e-mail, WhatsApp) ao receber um lead.
- Relatórios, dashboards ou métricas de conversão.
- Edição/exclusão de leads pelo próprio visitante.
- Multi-tenant (suporte a outras concessionárias).

## 8. Critérios de aceite

- [ ] Formulário público captura os 4 campos, valida e dá feedback visual em todos os estados.
- [ ] Lead criado pelo formulário aparece na listagem do painel administrativo.
- [ ] Login do painel bloqueia acesso sem credenciais válidas.
- [ ] É possível avançar o status de um lead pelo fluxo `Novo → Em contato → Convertido` ou `→ Perdido`.
- [ ] Landing e painel utilizáveis em viewport de celular.
- [ ] Sistema acessível publicamente via link HTTPS (não apenas `localhost`).
- [ ] Repositório público com README cobrindo setup local, decisões técnicas e plano para produção.

## 9. Entregáveis e prazo

- Link do sistema em produção.
- Link do repositório (GitHub).
- README completo.
- Prazo: **48 horas** a partir do recebimento do teste.
