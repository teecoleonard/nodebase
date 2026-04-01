import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/app-layout";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ALG Gestão - Sistema de Locação",
  description: "Sistema de gestão de locação de equipamentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} ${sourceSerif4.variable} antialiased`}
      >
        <TRPCReactProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
