'use client';

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

/**
 * Renders a "Sair" button that signs the current user out and redirects to the login page on success.
 *
 * When clicked, the button calls `authClient.signOut`. If sign-out succeeds, the component navigates to `/login`.
 */
export function LogoutButton() {
    const router = useRouter();
    
    return (
        <Button onClick={() => authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                }
            },
        })}>
            Sair
        </Button>
    );
};