import { test, expect } from "@playwright/test";

/**
 * Testes de Smoke (fumaça) - Validação básica de funcionalidades críticas
 * Estes testes verificam que as funcionalidades principais estão acessíveis
 */

test.describe("Smoke Tests - Funcionalidades Principais", () => {
  test("deve acessar a página inicial sem erros", async ({ page }) => {
    await page.goto("/");
    
    // Verifica que não há erros no console
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState("networkidle");
    
    // Verifica que não há erros críticos (pode ter warnings)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("warning") &&
        !error.includes("deprecated") &&
        !error.includes("devtools")
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test("deve verificar que o servidor está respondendo", async ({ page }) => {
    const response = await page.goto("/");
    
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    expect(response?.ok()).toBe(true);
  });

  test("deve verificar que o HTML está bem formado", async ({ page }) => {
    await page.goto("/");
    
    // Verifica que há um elemento html
    const html = page.locator("html");
    await expect(html).toBeAttached();
    
    // Verifica que há um elemento body
    const body = page.locator("body");
    await expect(body).toBeAttached();
    await expect(body).toBeVisible();
  });

  test("deve verificar que não há erros de rede críticos", async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on("requestfailed", (request) => {
      // Ignora requests que podem falhar normalmente (analytics, etc)
      const url = request.url();
      if (
        !url.includes("analytics") &&
        !url.includes("google") &&
        !url.includes("facebook") &&
        !url.includes("ads")
      ) {
        failedRequests.push(url);
      }
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Verifica que não há requests críticos falhando
    expect(failedRequests.length).toBe(0);
  });
});

