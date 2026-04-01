import { test, expect } from "@playwright/test";

/**
 * Testes básicos de validação do Playwright
 * Estes testes verificam que o Playwright está configurado corretamente
 * e que a aplicação está respondendo
 */

test.describe("Validação Inicial do Playwright", () => {
  test("deve carregar a página inicial", async ({ page }) => {
    await page.goto("/");
    
    // Verifica que a página carregou
    await expect(page).toHaveTitle(/ALG|Gestão|Faturamento/i);
  });

  test("deve verificar que a página não está vazia", async ({ page }) => {
    await page.goto("/");
    
    // Verifica que há algum conteúdo na página
    const body = page.locator("body");
    await expect(body).toBeVisible();
    
    // Verifica que há pelo menos algum texto na página
    const textContent = await body.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test("deve verificar estrutura básica HTML", async ({ page }) => {
    await page.goto("/");
    
    // Verifica elementos básicos do HTML
    await expect(page.locator("html")).toBeVisible();
    await expect(page.locator("head")).toBeAttached();
    await expect(page.locator("body")).toBeAttached();
  });
});

test.describe("Validação de Navegação", () => {
  test("deve navegar para página de login", async ({ page }) => {
    await page.goto("/");
    
    // Tenta encontrar link ou botão de login
    // Se não existir, navega diretamente
    const loginLink = page.getByRole("link", { name: /login|entrar|sign in/i });
    
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await page.waitForURL(/login/i);
    } else {
      await page.goto("/login");
    }
    
    // Verifica que está na página de login
    await expect(page).toHaveURL(/login/i);
  });

  test("deve verificar que a página responde com status 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});

test.describe("Validação de Responsividade", () => {
  test("deve funcionar em mobile viewport", async ({ page }) => {
    // Define viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Verifica que a página ainda carrega
    await expect(page.locator("body")).toBeVisible();
  });

  test("deve funcionar em desktop viewport", async ({ page }) => {
    // Define viewport desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    
    // Verifica que a página carrega
    await expect(page.locator("body")).toBeVisible();
  });
});

