'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, UserCog, History, ShieldAlert, Settings } from "lucide-react";
import { useMySubscription } from "@/hooks/queries/useSubscriptions";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: sub } = useMySubscription();

  const menuItems = [
    { name: "Thông tin chung", href: "/ops/settings", icon: <Settings size={18} />, exact: true },
    { name: "Quản lý Người dùng", href: "/ops/settings/users", icon: <UserCog size={18} />, exact: false },
    { name: "Phân quyền (Roles)", href: "/ops/settings/roles", icon: <ShieldCheck size={18} />, exact: false },
    { name: "Nhật ký Hoạt động", href: "/ops/settings/audit-logs", icon: <History size={18} />, exact: false },
    { name: "Nhật ký Bảo mật", href: "/ops/settings/security-logs", icon: <ShieldAlert size={18} />, exact: false },
  ];

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-edu-fg">Quản trị Hệ thống</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const isBasic = sub?.planName?.toLowerCase().includes("basic") || sub?.planName?.toLowerCase().includes("free");
            const isLocked = isBasic && (item.name === "Quản lý Người dùng" || item.name === "Phân quyền (Roles)");

            if (isLocked) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed opacity-75"
                  title="Tính năng không khả dụng ở gói Basic"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>
                  <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-bold">LOCKED</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                    : "text-edu-fgSecondary hover:bg-gray-100 hover:text-edu-fg"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
