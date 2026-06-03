'use client';

import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuditLogs } from '@/hooks/queries/useAuditLogs';
import { AuditLogTable } from './_components/AuditLogTable';

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Audit Logs</h2>
          <p className="text-edu-muted text-sm">Theo dõi toàn bộ lịch sử hoạt động và thay đổi trên hệ thống</p>
        </div>
        <Button variant="secondary" className="gap-2 bg-white hover:bg-gray-50 border-edu-border border">
          <Download size={18} className="text-edu-muted" />
          Xuất Báo Cáo
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={18} />
          <Input placeholder="Tìm kiếm theo người dùng, hành động..." className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2">
          <Select>
            <option value="">Tất cả loại hình</option>
            <option value="security">Bảo mật</option>
            <option value="billing">Thanh toán</option>
            <option value="create">Tạo mới</option>
          </Select>
          <Button variant="outline" className="gap-2 bg-white">
            <Filter size={18} /> Lọc
          </Button>
        </div>
      </div>

      <AuditLogTable logs={logs} isLoading={isLoading} />
    </div>
  );
}
