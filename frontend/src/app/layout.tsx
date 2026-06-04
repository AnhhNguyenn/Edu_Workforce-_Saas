import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Providers from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduOps — Workforce & Class Operations",
  description: "Platform quản lý vận hành trung tâm và giáo viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen bg-edu-bg bg-gradient-to-b from-[#E8F0FB] via-[#F4F8FD] to-[#FAFCFF]`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
