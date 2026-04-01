import { ArrowLeft, User, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters/date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function PerfilPage() {
  const session = await requireAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Suas informações pessoais e dados de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar e Nome */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="text-2xl">
                {getInitials(session.user.name || "Usuario")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{session.user.name || "Usuário"}</h2>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                <User className="h-4 w-4" />
                Nome Completo
              </p>
              <p className="font-medium">{session.user.name || "Não informado"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="font-medium">{session.user.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4" />
                Conta Criada em
              </p>
              <p className="font-medium">
                {session.user.createdAt ? formatDate(new Date(session.user.createdAt)) : "Não disponível"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4" />
                Última Atualização
              </p>
              <p className="font-medium">
                {session.user.updatedAt ? formatDate(new Date(session.user.updatedAt)) : "Não disponível"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Conta</CardTitle>
          <CardDescription>
            Gerencie suas preferências e segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" disabled>
            Editar Perfil
            <span className="ml-auto text-xs text-muted-foreground">(Em breve)</span>
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            Alterar Senha
            <span className="ml-auto text-xs text-muted-foreground">(Em breve)</span>
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            Configurações de Notificação
            <span className="ml-auto text-xs text-muted-foreground">(Em breve)</span>
          </Button>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Sistema:</strong> ALG Gestão - Sistema de Locação de Equipamentos
          </p>
          <p>
            <strong>Versão:</strong> 1.0.0
          </p>
          <p>
            <strong>Desenvolvido com:</strong> Next.js, TypeScript, tRPC, Prisma
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

