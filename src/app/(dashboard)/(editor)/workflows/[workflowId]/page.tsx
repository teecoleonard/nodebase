import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
};

const Page = async ({ 
    params }: PageProps) => {
        await requireAuth();
        const { workflowId } = await params;
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center gap-y-6 flex-col">
        Workflow Id: {workflowId}
    </div>
  )
}   

export default Page;