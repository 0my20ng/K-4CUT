import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "K4CUT - Life Four Cuts AI",
  description: "Create your own Life Four Cuts with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <AuthProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <footer className="py-8 border-t border-secondary/10">
            <div className="container-custom text-center text-xs text-secondary font-mono">
              © 2024 K4CUT. All rights reserved.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
