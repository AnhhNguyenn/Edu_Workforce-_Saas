'use client';

import { useSystemSettings } from "@/hooks/queries/useSystemSettings";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
}

export function FeatureGuard({ featureKey, children }: FeatureGuardProps) {
  const { data: settings, isLoading } = useSystemSettings();

  if (isLoading) {
    return <div className="p-10 text-center text-edu-muted animate-pulse">Đang kiểm tra quyền truy cập...</div>;
  }

  // Find the setting
  const setting = settings?.find(s => s.settingKey === featureKey);
  
  // Default to true if the setting doesn't exist yet (to prevent breaking everything before db is seeded)
  const isEnabled = setting ? setting.settingValue === 'true' : true;

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-edu-warning/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="text-edu-warning" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-edu-fg mb-4">Tính năng đang bảo trì</h2>
        <p className="text-edu-muted max-w-md mx-auto mb-8 leading-relaxed">
          Quản trị viên đã tạm thời khóa tính năng này để nâng cấp hoặc bảo trì hệ thống. Vui lòng quay lại sau!
        </p>
        <Button onClick={() => window.history.back()} variant="secondary" className="px-8">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
