import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
};

const Page = async ({ 
    params }: PageProps) => {
      await requireAuth();
        const { executionId } = await params;
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center gap-y-6 flex-col">
        Execution Id: {executionId}
    </div>
  )
}   

export default Page;