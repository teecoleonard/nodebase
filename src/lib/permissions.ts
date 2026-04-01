/**
 * Sistema de Permissões e Roles
 * 
 * Define as permissões do sistema e funções para verificar acesso
 */

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  VIEWER = "VIEWER",
}

/**
 * Permissões disponíveis no sistema
 */
export enum Permission {
  // Clientes
  CLIENTES_VIEW = "clientes:view",
  CLIENTES_CREATE = "clientes:create",
  CLIENTES_UPDATE = "clientes:update",
  CLIENTES_DELETE = "clientes:delete",

  // Equipamentos
  EQUIPAMENTOS_VIEW = "equipamentos:view",
  EQUIPAMENTOS_CREATE = "equipamentos:create",
  EQUIPAMENTOS_UPDATE = "equipamentos:update",
  EQUIPAMENTOS_DELETE = "equipamentos:delete",

  // Contratos
  CONTRATOS_VIEW = "contratos:view",
  CONTRATOS_CREATE = "contratos:create",
  CONTRATOS_UPDATE = "contratos:update",
  CONTRATOS_DELETE = "contratos:delete",
  CONTRATOS_ASSINAR = "contratos:assinar",

  // Devoluções
  DEVOLUCOES_VIEW = "devolucoes:view",
  DEVOLUCOES_CREATE = "devolucoes:create",
  DEVOLUCOES_UPDATE = "devolucoes:update",
  DEVOLUCOES_CONFIRMAR = "devolucoes:confirmar",

  // Faturas
  FATURAS_VIEW = "faturas:view",
  FATURAS_CREATE = "faturas:create",
  FATURAS_UPDATE = "faturas:update",
  FATURAS_DELETE = "faturas:delete",
  FATURAS_PAGAR = "faturas:pagar",
  FATURAS_CANCELAR = "faturas:cancelar",
  FATURAS_GERAR_AUTOMATICAS = "faturas:gerar_automaticas",

  // Dashboard
  DASHBOARD_VIEW = "dashboard:view",

  // Admin
  ADMIN_VIEW = "admin:view",
  ADMIN_MANAGE_USERS = "admin:manage_users",
  ADMIN_MANAGE_AUTOMACOES = "admin:manage_automacoes",
}

/**
 * Mapeamento de roles para permissões
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin tem todas as permissões
    ...Object.values(Permission),
  ],
  [UserRole.USER]: [
    // Usuário tem permissões de criação e edição
    Permission.CLIENTES_VIEW,
    Permission.CLIENTES_CREATE,
    Permission.CLIENTES_UPDATE,
    Permission.EQUIPAMENTOS_VIEW,
    Permission.EQUIPAMENTOS_CREATE,
    Permission.EQUIPAMENTOS_UPDATE,
    Permission.CONTRATOS_VIEW,
    Permission.CONTRATOS_CREATE,
    Permission.CONTRATOS_UPDATE,
    Permission.CONTRATOS_ASSINAR,
    Permission.DEVOLUCOES_VIEW,
    Permission.DEVOLUCOES_CREATE,
    Permission.DEVOLUCOES_UPDATE,
    Permission.DEVOLUCOES_CONFIRMAR,
    Permission.FATURAS_VIEW,
    Permission.FATURAS_CREATE,
    Permission.FATURAS_UPDATE,
    Permission.FATURAS_PAGAR,
    Permission.DASHBOARD_VIEW,
  ],
  [UserRole.VIEWER]: [
    // Visualizador tem apenas permissões de leitura
    Permission.CLIENTES_VIEW,
    Permission.EQUIPAMENTOS_VIEW,
    Permission.CONTRATOS_VIEW,
    Permission.DEVOLUCOES_VIEW,
    Permission.FATURAS_VIEW,
    Permission.DASHBOARD_VIEW,
  ],
};

/**
 * Verifica se um role tem uma permissão específica
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Verifica se um role tem pelo menos uma das permissões fornecidas
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica se um role tem todas as permissões fornecidas
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Obtém todas as permissões de um role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verifica se um role é admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Verifica se um role pode editar (USER ou ADMIN)
 */
export function canEdit(role: UserRole): boolean {
  return role === UserRole.USER || role === UserRole.ADMIN;
}

/**
 * Verifica se um role pode deletar (apenas ADMIN)
 */
export function canDelete(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

