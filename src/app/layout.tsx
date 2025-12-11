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
          <div className="flex-1 flex flex-col items-center w-full">
            <main className="w-full flex-1">
              {children}
            </main>
          </div>
          <footer className="py-12 border-t border-border mt-auto">
            <div className="container-custom text-center space-y-2">
              <p className="text-secondary text-sm font-medium tracking-wide">K4CUT STUDIO</p>
              <p className="text-xs text-secondary/60 font-mono">
                © 2025 K4CUT. All rights reserved.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
