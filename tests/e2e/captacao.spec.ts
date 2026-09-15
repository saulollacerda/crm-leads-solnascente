import { expect, test } from "@playwright/test";

const nomeUnico = () => `Teste E2E ${Date.now()}`;

test("a raiz leva para o modelo em destaque", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/modelos/cg-160-fan");
  await expect(page.getByRole("heading", { name: "CG 160 Fan" })).toBeVisible();
});

test("trocar de modelo navega e atualiza o formulário", async ({ page }) => {
  await page.goto("/modelos/cg-160-fan");

  await page.getByRole("link", { name: /Biz 125/ }).click();

  await expect(page).toHaveURL("/modelos/biz-125");
  await expect(page.getByLabel("Modelo de interesse")).toHaveValue("Biz 125");
});

test("o formulário cobra os campos antes de enviar", async ({ page }) => {
  await page.goto("/modelos/cg-160-fan");

  await page.getByRole("button", { name: /quero falar com um especialista/i }).click();

  await expect(page.getByText("Não foi possível enviar")).toBeVisible();
  await expect(page.getByText("Informe seu nome.")).toBeVisible();
});

test("registra o interesse e devolve o protocolo", async ({ page }) => {
  await page.goto("/modelos/cg-160-fan");

  await page.getByLabel("Nome").fill(nomeUnico());
  await page.getByLabel("WhatsApp").fill("86998124471");
  await page.getByRole("button", { name: "Timon" }).click();
  await page.getByRole("checkbox").check();

  await page.getByRole("button", { name: /quero falar com um especialista/i }).click();

  await expect(page.getByText("Interesse registrado")).toBeVisible();
  await expect(page.getByText(/^#SN-\d{4}-\d{4}$/)).toBeVisible();
  // A unidade escolhida é repetida na confirmação, em negrito.
  await expect(page.getByText("Timon", { exact: true })).toBeVisible();
});
