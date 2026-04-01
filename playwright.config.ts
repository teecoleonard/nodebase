import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Executa testes em paralelo */
  fullyParallel: true,
  /* Falha o build se você deixar test.only no CI */
  forbidOnly: !!process.env.CI,
  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,
  /* Workers em CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter para usar */
  reporter: "html",
  /* Opções compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em ações como `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    /* Coleta trace quando retry o teste falhado. Veja https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot apenas quando falha */
    screenshot: "only-on-failure",
  },

  /* Configura projetos para principais navegadores */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Testes em dispositivos móveis */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Executa o servidor de desenvolvimento antes de iniciar os testes */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

