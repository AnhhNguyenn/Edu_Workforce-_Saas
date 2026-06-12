'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Cài đặt trung tâm</h2>
          <p className="text-edu-muted text-sm">Quản lý thông tin chung và cấu hình hệ thống tại EduCenter Sài Gòn</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-6 border-b border-edu-border">
          <h3 className="text-lg font-bold text-edu-fg mb-4">Thông tin cơ bản</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-sm text-edu-fgSecondary">Tên trung tâm</label>
              <div className="col-span-2">
                <Input defaultValue="EduCenter Sài Gòn" className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-sm text-edu-fgSecondary">Mã số thuế</label>
              <div className="col-span-2">
                <Input defaultValue="0101234567" className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-sm text-edu-fgSecondary">Địa chỉ</label>
              <div className="col-span-2">
                <Input defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" className="focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 pt-4 border-t border-edu-border">
              <label className="font-medium text-sm text-edu-fgSecondary">Gói hiện tại</label>
              <div className="col-span-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-edu-accent">Enterprise</span>
                  <span className="text-xs text-edu-muted ml-2">(Hết hạn: 31/12/2025)</span>
                </div>
                <Button variant="secondary" size="sm">Nâng cấp</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50/50 flex justify-end gap-3">
          <Button variant="secondary">Hủy bỏ</Button>
          <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white">Lưu thay đổi</Button>
        </div>
      </div>
    </div>
  );
}
