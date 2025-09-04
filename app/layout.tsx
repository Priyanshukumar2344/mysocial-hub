
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import type React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NavBar } from "@/components/NavBar";
import { AIMentorChatBubble } from "@/components/AIMentorChatBubble";
import { SectionNotificationsProvider } from "@/contexts/SectionNotificationsContext";
import { ClientLayouts } from "@/components/ClientLayouts"; // ✅ new wrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AITD Social Hub",
  description: "Connect, share, and learn with AITD Social Hub",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <SectionNotificationsProvider>
              <ClientLayouts>
                <NavBar />
                <main className="container mx-auto px-4 py-4 pt-20">{children}</main>
                <AIMentorChatBubble />
              </ClientLayouts>
              <Toaster />
            </SectionNotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
