'use client';

import {
    CreditCardIcon,
    FolderOpenIcon,
    HistoryIcon,
    icons,
    KeyIcon,
    LogOutIcon,
    StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { 
    Sidebar, 
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,    
} from "@/components/ui/sidebar";

import { authClient } from "@/lib/auth-client";

const menuItems = [
    {
        title: "Workflows",
        item: [
            {
                title: "Workflows",
                icon: FolderOpenIcon,
                url: "/workflows",
            },
            {
                title: "Executions",
                icon: HistoryIcon,
                url: "/executions",
            },
            {
                title: "Credentials",
                icon: KeyIcon,
                url: "/credentials",
            }
        ]
    },
];

export const AppSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton asChild className="gap-x-2 h-10 px-4">
                    <Link href="/" prefetch>
                        <Image src="/logos/logo.svg" alt="NodeBase" width={30} height={30} />
                        <span className="font-semibold text-sm">Nodebase</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                                <SidebarMenu>
                                {group.item.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={
                                                item.url === "/"
                                                    ? pathname === "/"
                                                    : pathname.startsWith(item.url)
                                            }
                                            asChild
                                            className="gap-x-4 h-10 px-4"
                                        >
                                            <Link href={item.url} prefetch>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>

                                            </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Melhore para o plano Pro"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {}}
                        >
                            <StarIcon className="h-4 w-4" />
                            <span>Melhore para o plano Pro</span>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            tooltip="Central de Compras"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {}}
                        >
                            <CreditCardIcon className="h-4 w-4" />
                            <span>Central de Compras</span>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            tooltip="Sair"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {
                                authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            router.push("/login");
                                        },
                                    },
                                });
                            }}
                        >
                            <LogOutIcon className="h-4 w-4" />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}