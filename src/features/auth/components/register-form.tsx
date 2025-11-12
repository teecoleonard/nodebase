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
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
    email: z.email("Por favor, insira um email válido"),
    password: z.string().min(1, "Senha é obrigatória"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
})
.refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email({
            name: values.email,
            email: values.email,
            password: values.password,
            callbackURL: "/",
        },
        {
            onSuccess: () => {
                toast.success("Conta criada com sucesso!");
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
                    <CardTitle>Começe agora!</CardTitle>
                    <CardDescription>
                        Crie sua conta para continuar
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
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmação de senha</FormLabel>
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
                                            Criar conta
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Já possui uma conta? {" "} <Link href="/login" className="underline underline-offset-4">Faça login agora</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}