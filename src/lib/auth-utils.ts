import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";
import { UserRole, Permission, hasPermission } from "./permissions";
import prisma from "./db";

export const requireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }
    return session;
};

export const requireUnauth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session) {
        redirect("/");
    }
};

/**
 * Obtém o role do usuário atual
 */
export async function getUserRole(userId: string): Promise<UserRole> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user) {
        return UserRole.VIEWER; // Default para segurança
    }

    return user.role as UserRole;
}

/**
 * Requer que o usuário tenha um role específico
 */
export async function requireRole(requiredRole: UserRole) {
    const session = await requireAuth();
    
    const userRole = await getUserRole(session.user.id);
    
    if (userRole !== requiredRole && userRole !== UserRole.ADMIN) {
        redirect("/");
    }
    
    return { session, userRole };
}

/**
 * Requer que o usuário seja admin
 */
export async function requireAdmin() {
    return requireRole(UserRole.ADMIN);
}

/**
 * Requer que o usuário tenha uma permissão específica
 */
export async function requirePermission(permission: Permission) {
    const session = await requireAuth();
    const userRole = await getUserRole(session.user.id);
    
    if (!hasPermission(userRole, permission)) {
        redirect("/");
    }
    
    return { session, userRole };
}