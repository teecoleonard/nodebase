'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";

const loginSchema = z.object({
    email: z.string().email("Por favor, insira um email válido"),
    password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const logLoginMutation = trpc.audit.logLogin.useMutation();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/",
        },
        {
            onSuccess: async (ctx) => {
                // Registrar log de login
                try {
                    // Aguarda um pouco para garantir que a sessão foi criada
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    // Tenta obter userId de diferentes propriedades do contexto
                    const userId = ctx.user?.id || ctx.data?.user?.id || (ctx as any).session?.user?.id;
                    const userEmail = ctx.user?.email || ctx.data?.user?.email || (ctx as any).session?.user?.email;
                    
                    if (userId) {
                        await logLoginMutation.mutateAsync({
                            userId,
                            userEmail,
                        });
                    } else {
                        console.warn("Não foi possível obter userId do contexto de login");
                    }
                } catch (error) {
                    // Não falha o login se o log falhar
                    console.error("Erro ao registrar log de login:", error);
                }
                
                toast.success("Login realizado com sucesso!");
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message ?? "Erro ao fazer login");
            },
        }
    )
    };
    
    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Bem-vindo de volta!</CardTitle>
                    <CardDescription>
                        Acesse o sistema de gestão de locação de equipamentos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="email" 
                                                placeholder="seu@email.com" 
                                                {...field} 
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                {...field} 
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isPending}>
                                {isPending ? "Entrando..." : "Entrar"}
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Não tem uma conta?{" "}
                                <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                                    Crie uma agora
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}