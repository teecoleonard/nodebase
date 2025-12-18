'use client';

import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("AI executado com sucesso");
    },
    onError: () => {
      toast.error("Algo deu errado");
    }
  }));

  const queryClient = useQueryClient();
  const create = useMutation(trpc.createWorkflow.mutationOptions(
    {
      onSuccess: () => {
        toast.success("Workflow criado com sucesso");
      }
    }
  ));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center gap-y-6 flex-col">
      protected page
      <div>
      {JSON.stringify(data, null, 2)}
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>Test AI</Button>
      </div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>Create Workflow</Button>
      <LogoutButton />
    </div>
  )
};

export default Page;