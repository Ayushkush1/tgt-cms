import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AdminSidebar } from "./components/Sidebar";
import { ConfirmDeleteProvider } from "./components/ConfirmDeleteModal";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

async function getCmsFavicon(): Promise<string | null> {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: "global" },
      select: { favicon: true },
    });
    return config?.favicon?.trim() || null;
  } catch {
    return null;
  }
}

function faviconMimeType(url: string): string {
  if (/\.webp(\?|$)/i.test(url)) return "image/webp";
  if (/\.png(\?|$)/i.test(url)) return "image/png";
  if (/\.(jpg|jpeg)(\?|$)/i.test(url)) return "image/jpeg";
  if (/\.svg(\?|$)/i.test(url)) return "image/svg+xml";
  return "image/x-icon";
}

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getCmsFavicon();
  return {
    title: "The Gold Technologies - Admin Dashboard",
    description: "Admin dashboard for The Gold Technologies",
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, favicon] = await Promise.all([auth(), getCmsFavicon()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>{favicon && <link rel="icon" href={favicon} type={faviconMimeType(favicon)} />}</head>
      <body
        className={`${inter.variable} ${playfair.variable} bg-[#f8f9fa] antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <ConfirmDeleteProvider>
            {session ? (
              <div className="flex h-screen overflow-hidden p-[5px] font-sans">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto">
                  <div className="px-12 py-10">{children}</div>
                </main>
              </div>
            ) : (
              <div className="font-sans">{children}</div>
            )}
          </ConfirmDeleteProvider>
        </SessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: "var(--font-inter)", fontSize: "14px" },
            error: {
              style: {
                background: "#fff0f0",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              },
            },
            success: {
              style: {
                background: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #bbf7d0",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
