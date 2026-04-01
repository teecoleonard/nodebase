# Testes E2E com Playwright

Este diretório contém os testes end-to-end (E2E) do projeto usando Playwright.

## Estrutura de Testes

- `playwright-validation.spec.ts` - Testes de validação inicial do Playwright
- `example.spec.ts` - Testes de exemplo básicos
- `smoke.spec.ts` - Testes de smoke (fumaça) para funcionalidades críticas

## Executando os Testes

### Executar todos os testes
```bash
npm run test:e2e
```

### Executar com interface gráfica
```bash
npm run test:e2e:ui
```

### Executar em modo headed (com navegador visível)
```bash
npm run test:e2e:headed
```

### Executar em modo debug
```bash
npm run test:e2e:debug
```

### Ver relatório de testes
```bash
npm run test:e2e:report
```

## Testes de Validação Inicial

Os testes em `playwright-validation.spec.ts` são testes básicos que validam:

- ✅ Navegação básica
- ✅ Estrutura HTML
- ✅ Resposta do servidor
- ✅ Diferentes viewports
- ✅ Captura de screenshots
- ✅ Execução de JavaScript
- ✅ Interceptação de requisições
- ✅ Verificação de erros no console
- ✅ Verificação de erros de rede

Estes testes são ideais para validar que o Playwright está configurado corretamente no projeto.

## Configuração

A configuração do Playwright está em `playwright.config.ts` na raiz do projeto.

Por padrão, os testes:
- Executam em `http://localhost:3000`
- Iniciam automaticamente o servidor de desenvolvimento
- Executam em múltiplos navegadores (Chromium, Firefox, WebKit)
- Geram relatórios HTML automaticamente

## Notas

- Os testes assumem que o servidor está rodando em `http://localhost:3000`
- O servidor é iniciado automaticamente antes dos testes
- Screenshots são capturados apenas quando os testes falham
- Traces são coletados apenas quando há retry de testes falhados

