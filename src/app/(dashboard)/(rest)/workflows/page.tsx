import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
    await requireAuth();
    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center gap-y-6 flex-col">
            workflows
        </div>
    )
  }

  export default Page;