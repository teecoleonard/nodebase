'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
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

const loginSchema = z.object({
    email: z.email("Por favor, insira um email válido"),
    password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();

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
            onSuccess: () => {
                toast.success("Login realizado com sucesso!");
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
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
                        Faça login para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={isPending}
                                        >
                                        Continuar com GitHub
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={isPending}
                                        >
                                        Continuar com Google
                                    </Button>
                                </div>
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email" 
                                                        placeholder="Email" 
                                                        {...field} 
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
                                                        placeholder="********" 
                                                        {...field} 
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
                                            Entrar
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Não tem uma conta? {" "} <Link href="/signup" className="underline underline-offset-4">Crie uma agora</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}