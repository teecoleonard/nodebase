import { Package } from "lucide-react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col justify-center bg-muted min-h-screen gap-6 p-6 md:p-10 items-center">
            <div className="max-w-sm w-full flex flex-col gap-6">
                <div className="flex items-center gap-2 self-center font-medium">
                    <Package className="h-8 w-8" />
                    <h1 className="text-2xl font-bold">ALG Gestão</h1>
                </div>
            {children}
        </div>
    </div>
    )
}

export default AuthLayout;