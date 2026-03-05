import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Gold Technologies - Admin Dashboard",
  description: "Admin dashboard for The Gold Technologies",
};

import { AdminSidebar } from "./components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#f8f9fa]`}
      >
        <div className="flex h-screen overflow-hidden font-sans">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className=" px-12 py-10">{children}</div>
          </main>
        </div>
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
