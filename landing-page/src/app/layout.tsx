import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const inter = Inter({ subsets: ["vietnamese", "latin"] });

// Cấu hình Schema.org chuẩn SaaS
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "EduOps - Nền tảng quản lý trung tâm",
  "operatingSystem": "Web",
  "applicationCategory": "EducationalApplication",
  "url": "https://eduops.vn"
};

export const metadata: Metadata = {
  title: {
    template: "%s | EduOps",
    default: "Phần mềm quản lý trung tâm giáo dục | EduOps",
  },
  description: "Nền tảng quản lý trung tâm tiếng Anh, gia sư, STEM toàn diện. Giải pháp tự động hóa lịch học, điểm danh và doanh thu.",
  metadataBase: new URL("https://eduops.vn"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "Vui_long_dien_Google_Search_Console_ID_vao_day",
  },
  openGraph: {
    title: "Phần mềm quản lý trung tâm giáo dục | EduOps",
    description: "Nền tảng quản lý trung tâm tiếng Anh, gia sư, STEM toàn diện.",
    url: "https://eduops.vn",
    siteName: "EduOps",
    images: [
      {
        url: "/api/og", // Sẽ thay bằng api thật sau
        width: 1200,
        height: 630,
        alt: "EduOps - Phần mềm quản lý trung tâm",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#FAFAFA] antialiased flex flex-col selection:bg-blue-200 selection:text-blue-900`}>
        {/* Schema.org Software JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        
        {/* Google Analytics (Giai đoạn 1 Tracking) */}
        <GoogleAnalytics />

        {/* Global Header */}
        <SiteHeader />

        <main className="flex-1 w-full relative">
          {children}
        </main>
        
        {/* Global Footer */}
        <SiteFooter />
      </body>
    </html>
  );
}
