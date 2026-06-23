'use client';

import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuditLogs } from '@/hooks/queries/useAuditLogs';
import { AuditLogTable } from './_components/AuditLogTable';
import { AiAnalyticsChart } from './_components/AiAnalyticsChart';
import { useState, useMemo, useEffect } from 'react';

import { FeatureGuard } from '@/components/ui/feature-guard';

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      const matchSearch = debouncedSearch === '' || 
        log.userEmail?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        log.action?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        log.details?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchAction = actionFilter === '' || log.module === actionFilter || log.action?.toLowerCase().includes(actionFilter.toLowerCase());
      
      return matchSearch && matchAction;
    });
  }, [logs, debouncedSearch, actionFilter]);

  return (
    <FeatureGuard featureKey="FEATURE_AUDIT_LOGS">
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
            <Input 
              placeholder="Tìm kiếm theo người dùng, hành động..." 
              className="pl-10 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select 
              value={actionFilter}
              onChange={(val) => setActionFilter(val)}
              options={[
                { value: "", label: "Tất cả loại hình" },
                { value: "AI_USAGE_LOG", label: "Tiêu thụ AI (Tokens)" },
                { value: "security", label: "Bảo mật" },
                { value: "billing", label: "Thanh toán" },
                { value: "create", label: "Tạo mới" }
              ]}
            />
            <Button variant="outline" className="gap-2 bg-white">
              <Filter size={18} /> Lọc
            </Button>
          </div>
        </div>

        {/* AI Analytics Chart Section */}
        {actionFilter === '' || actionFilter === 'AI_USAGE_LOG' ? (
          <AiAnalyticsChart logs={logs} />
        ) : null}

        <AuditLogTable 
          logs={filteredLogs} 
          isLoading={isLoading} 
          hasFilter={!!searchTerm || !!actionFilter}
          onClearFilter={() => { setSearchTerm(''); setActionFilter(''); }}
        />
      </div>
    </FeatureGuard>
  );
}

