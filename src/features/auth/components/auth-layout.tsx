import Link from "next/link"
import Image from "next/image"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col justify-center bg-muted min-h-screen gap-6 p-6 md:p-10 items-center">
            <div className="max-w-sm w-full flex flex-col gap-6">
                <Link href="/" className="flex items-center gap-2 self-center font-medium">
                    <Image src="/logos/name-logo.svg" alt="Logo" width={150} height={150} />
                </Link>
            {children}
        </div>
    </div>
    )
}

export default AuthLayout;