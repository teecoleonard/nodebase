import { getQueryClient } from "@/trpc/server";
import { Client } from "./client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { trpc } from "@/trpc/server";
import { Suspense } from "react";

const Page = async () => {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <div className="min-h-screen flex items-center justify-center">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>Loading...</div>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  )
};

export default Page;