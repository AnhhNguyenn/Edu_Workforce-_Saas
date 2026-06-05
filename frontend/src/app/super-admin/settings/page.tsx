'use client';

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/queries/useSystemSettings";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateMutation = useUpdateSystemSetting();

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      settings.forEach(s => {
        initial[s.settingKey] = s.settingValue;
      });
      setForm(initial);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (keys: string[]) => {
    for (const key of keys) {
      if (form[key] !== undefined) {
        await updateMutation.mutateAsync({ key, value: form[key] });
      }
    }
    toast.success('Đã lưu cấu hình thành công!');
  };

  if (isLoading) {
    return <div className="text-center text-edu-muted py-10">Đang tải cấu hình...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Settings</h2>
        <p className="text-edu-muted text-sm">Cấu hình hệ thống chung</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
          <h3 className="font-semibold text-edu-fg mb-4">Thông tin hệ thống</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Admin email</label>
              <Input 
                value={form['SYSTEM_ADMIN_EMAIL'] || ''} 
                onChange={(e) => handleChange('SYSTEM_ADMIN_EMAIL', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Tài khoản nhận thanh toán (SePay)</label>
              <Input 
                value={form['PAYMENT_BANK_ACCOUNT'] || ''} 
                onChange={(e) => handleChange('PAYMENT_BANK_ACCOUNT', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Ngân hàng (Mã BIN/Tên)</label>
              <Input 
                value={form['PAYMENT_BANK_NAME'] || ''} 
                onChange={(e) => handleChange('PAYMENT_BANK_NAME', e.target.value)}
              />
            </div>
            <Button 
              className="mt-4"
              onClick={() => handleSave(['SYSTEM_ADMIN_EMAIL', 'PAYMENT_BANK_ACCOUNT', 'PAYMENT_BANK_NAME'])}
              disabled={updateMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
          <h3 className="font-semibold text-edu-fg mb-4">Cấu hình Thời gian/Thử việc mặc định</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Số học viên tối đa (Gói Dùng Thử)</label>
              <Input 
                type="number" 
                value={form['DEFAULT_TRIAL_MAX_USERS'] || ''} 
                onChange={(e) => handleChange('DEFAULT_TRIAL_MAX_USERS', e.target.value)}
              />
            </div>
            <Button 
              className="mt-4"
              onClick={() => handleSave(['DEFAULT_TRIAL_MAX_USERS'])}
              disabled={updateMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6 col-span-1 md:col-span-2">
          <h3 className="font-semibold text-edu-fg mb-4">Công tắc Tính năng (Feature Toggles)</h3>
          <p className="text-sm text-edu-muted mb-4">Bật/tắt các module tính năng trên toàn bộ hệ thống. (Lưu lại để áp dụng ngay)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'FEATURE_AUDIT_LOGS', label: 'Audit Logs (Nhật ký hệ thống)' },
              { key: 'FEATURE_ANALYTICS', label: 'System Analytics (Thống kê)' },
              { key: 'FEATURE_ROLES', label: 'Roles & Permissions (Phân quyền)' },
              { key: 'FEATURE_PROMOTIONS', label: 'Promotions (Mã giảm giá)' }
            ].map(feature => (
              <div key={feature.key} className="flex items-center justify-between p-3 border border-edu-border rounded-lg">
                <span className="text-sm font-medium text-edu-fg">{feature.label}</span>
                <Select 
                  options={[
                    { value: 'true', label: 'Bật (ON)' },
                    { value: 'false', label: 'Tắt (OFF)' }
                  ]}
                  value={form[feature.key] || 'true'}
                  onChange={(v) => handleChange(feature.key, v)}
                  className="w-[120px]"
                />
              </div>
            ))}
          </div>
          <Button 
            className="mt-6"
            onClick={() => handleSave(['FEATURE_AUDIT_LOGS', 'FEATURE_ANALYTICS', 'FEATURE_ROLES', 'FEATURE_PROMOTIONS'])}
            disabled={updateMutation.isPending}
          >
            Lưu Công Tắc
          </Button>
        </div>
      </div>
    </div>
  );
}
