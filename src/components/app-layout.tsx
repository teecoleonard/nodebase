'use client';

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  Database,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  Receipt,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { Notificacoes } from "@/features/dashboard/components/notificacoes";
import { trpc } from "@/trpc/client";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Equipamentos", href: "/equipamentos", icon: Package },
  { name: "Contratos", href: "/contratos", icon: FileText },
  { name: "Devoluções", href: "/devolucoes", icon: PackageCheck },
  { name: "Faturas", href: "/faturas", icon: Receipt },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Automações", href: "/admin/automacoes", icon: Bot },
  { name: "Auditoria", href: "/admin/auditoria", icon: Shield },
  { name: "Backups", href: "/admin/backups", icon: Database },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logLogoutMutation = trpc.audit.logLogout.useMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        await logLogoutMutation.mutateAsync({
          userId: session.data.user.id,
          userEmail: session.data.user.email,
        });
      }
    } catch (error) {
      console.error("Erro ao registrar log de logout:", error);
    }

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const renderNavigation = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1 p-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            variant={isActive ? "secondary" : "ghost"}
            className="justify-start"
            asChild
          >
            <Link
              href={item.href}
              onClick={() => {
                onNavigate?.();
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="hidden w-64 flex-shrink-0 border-r bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:flex md:flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">ALG Gestão</h1>
          </div>
          <div className="flex-1 overflow-y-auto">{renderNavigation()}</div>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-64 flex-col p-0">
                  <div className="flex h-16 items-center border-b px-6">
                    <h2 className="text-lg font-semibold">ALG Gestão</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {renderNavigation(() => setMobileMenuOpen(false))}
                  </div>
                  <div className="border-t p-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex flex-col">
                <span className="text-base font-semibold leading-tight">
                  Sistema de Gestão de Locações
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Controle completo em qualquer dispositivo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Notificacoes />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/perfil" aria-label="Ir para o perfil">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

