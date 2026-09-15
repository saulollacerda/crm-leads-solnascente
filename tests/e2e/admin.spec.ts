import { expect, test, type Page } from "@playwright/test";

const USUARIO = process.env.ADMIN_USERNAME ?? "admin";
const SENHA = process.env.ADMIN_PASSWORD ?? "changeme";

async function entrar(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário").fill(USUARIO);
  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
}

async function criarLead(page: Page, nome: string, unidade: "Teresina" | "Timon") {
  await page.goto("/modelos/cg-160-fan");
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("WhatsApp").fill("86998124471");
  await page.getByRole("button", { name: unidade }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /quero falar/i }).click();
  await expect(page.getByText("Interesse registrado")).toBeVisible();
}

test("o painel exige sessão", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("credencial errada não entra", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário").fill(USUARIO);
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar no painel" }).click();

  // O próprio Next injeta um role="alert" para anúncio de rota; usar o do formulário.
  await expect(page.locator("form [role=alert]")).toContainText(
    "Usuário ou senha incorretos.",
  );
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("o lead captado aparece no painel", async ({ page }) => {
  const nome = `E2E painel ${Date.now()}`;
  await criarLead(page, nome, "Teresina");
  await entrar(page);

  await expect(page.getByText(nome)).toBeVisible();
});

test("avança o status pelo fluxo até Convertido", async ({ page }) => {
  const nome = `E2E status ${Date.now()}`;
  await criarLead(page, nome, "Teresina");
  await entrar(page);

  await page.getByRole("button", { name: new RegExp(nome) }).click();
  await expect(page.getByText("Lead selecionado")).toBeVisible();

  await page.getByRole("button", { name: "Marcar como Em contato" }).click();

  const converter = page.getByRole("button", { name: "Marcar como Convertido" });
  await expect(converter).toBeVisible();
  await converter.click();

  await expect(page.getByText("Status final — venda registrada.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Marcar como/ })).toHaveCount(0);
});

test("filtrar por unidade muda a URL e a lista", async ({ page }) => {
  const nome = `E2E filtro ${Date.now()}`;
  await criarLead(page, nome, "Timon");
  await entrar(page);

  await page.getByRole("link", { name: "Teresina", exact: true }).click();

  await expect(page).toHaveURL(/unidade=Teresina/);
  await expect(page.getByText(nome)).toHaveCount(0);
});
