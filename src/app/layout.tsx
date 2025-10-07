import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "@/trpc/react";
import { AppToaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Sage",
  description: "Your AI Research Assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Swapped Geist for Inter (professional, highly readable). Reuse the same
// CSS variable name so global styles referencing --font-geist-sans keep working
// without further changes.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            {children}
            {/* Global toast portal (Sonner) */}
            <AppToaster />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
