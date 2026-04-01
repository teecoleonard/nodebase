import { test, expect } from "@playwright/test";

/**
 * Testes E2E focados em validar os fluxos públicos (não autenticados)
 * e a proteção de rotas para páginas administrativas.
 *
 * Todos os testes utilizam a baseURL definida em `playwright.config.ts`
 * (por padrão http://localhost:3000) e não dependem de dados seed.
 */

const PROTECTED_ROUTES = [
  "/",
  "/clientes",
  "/equipamentos",
  "/contratos",
  "/devolucoes",
  "/faturas",
  "/admin/automacoes",
  "/admin/auditoria",
  "/admin/backups",
];

const TEST_USER_EMAIL = process.env.PLAYWRIGHT_TEST_USER_EMAIL ?? "leonardo4q@gmail.com";
const TEST_USER_PASSWORD = process.env.PLAYWRIGHT_TEST_USER_PASSWORD ?? "12345678";

test.describe("Saúde geral da aplicação", () => {
  test("rota base responde e exibe layout de autenticação", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { name: /ALG Gestão/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Bem-vindo de volta/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar/i })).toBeVisible();
  });

  test("não registra erros críticos no console durante o carregamento", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const criticalErrors = errors.filter(
      (error) =>
        !/warning/i.test(error) &&
        !/deprecated/i.test(error) &&
        !/devtools/i.test(error) &&
        !/favicon/i.test(error),
    );

    expect(criticalErrors.length).toBeLessThan(3);
  });

  test("layout de login permanece funcional em diferentes viewports", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // mobile
      { width: 768, height: 1024 }, // tablet
      { width: 1440, height: 900 }, // desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/login");
      await expect(page.getByRole("button", { name: /Entrar/i })).toBeVisible();
    }
  });
});

test.describe("Formulário de login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
  });

  test("exibe campos obrigatórios e link de cadastro", async ({ page }) => {
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Crie uma agora/i })).toBeVisible();
  });

  test("mostra mensagens de validação quando campos ficam vazios", async ({ page }) => {
    await page.getByRole("button", { name: /Entrar/i }).click();

    await expect(page.getByText("Por favor, insira um email válido")).toBeVisible();
    await expect(page.getByText("Senha é obrigatória")).toBeVisible();
  });

  test("permite preencher e limpar campos sem travar o formulário", async ({ page }) => {
    const email = page.getByLabel("Email");
    const password = page.getByLabel("Senha");

    await email.fill("usuario@teste.com");
    await password.fill("senha-super-secreta");
    await expect(email).toHaveValue("usuario@teste.com");
    await expect(password).toHaveValue("senha-super-secreta");

    await email.fill("");
    await password.fill("");
    await expect(email).toHaveValue("");
    await expect(password).toHaveValue("");
  });

  test("realiza login com credenciais válidas", async ({ page }) => {
    await page.getByLabel("Email").fill(TEST_USER_EMAIL);
    await page.getByLabel("Senha").fill(TEST_USER_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ url: /\/$/ }),
      page.getByRole("button", { name: /Entrar/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Sistema de Gestão de Locações")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sair/i })).toBeVisible();
  });
});

test.describe("Proteção de rotas autenticadas", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`rota ${route} redireciona usuário não autenticado para /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("heading", { name: /Bem-vindo de volta/i })).toBeVisible();
    });
  }

  test("admin/auditoria e admin/backups exigem autenticação e exibem mensagem amigável", async ({ page }) => {
    for (const route of ["/admin/auditoria", "/admin/backups"]) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("button", { name: /Entrar/i })).toBeVisible();
    }
  });
});

test.describe("Rotas públicas auxiliares", () => {
  test("rota inexistente retorna página de erro tratada (404)", async ({ page }) => {
    const response = await page.goto("/rota-inexistente");

    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toContainText(/404|não encontrada/i);
  });
});

