import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
};

const Page = async ({ 
    params }: PageProps) => {
        await requireAuth();

        const { credentialId } = await params;
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center gap-y-6 flex-col">
        Credential Id: {credentialId}
    </div>
  )
}   

export default Page;