'use client';

import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AUDIT_LOGS } from "@/lib/mock-data";

export default function AuditLogsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Audit Logs</h2>
          <p className="text-edu-muted text-sm">Nhật ký hoạt động của hệ thống EduOps</p>
        </div>
        <Button className="gap-2" variant="secondary">
          <Download size={18} />
          Xuất báo cáo
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4 bg-gray-50/50">
          <div className="flex flex-1 max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input placeholder="Tìm kiếm hành động, người dùng..." className="pl-9 h-9 text-sm" />
            </div>
            <div className="w-40">
              <Select 
                options={[
                  { value: 'all', label: 'Tất cả loại (Type)' },
                  { value: 'security', label: 'Security' },
                  { value: 'billing', label: 'Billing' },
                  { value: 'create', label: 'Create' }
                ]}
                placeholder="Loại..."
                className="h-9 w-full border-edu-border focus:ring-1 bg-white text-edu-fgSecondary"
              />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Thời gian</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead>Phân loại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {AUDIT_LOGS.map((log, i) => (
              <TableRow key={i}>
                <TableCell className="text-edu-muted text-xs whitespace-nowrap">{log.time}</TableCell>
                <TableCell className="font-medium text-edu-fg">{log.user}</TableCell>
                <TableCell className="font-semibold text-edu-fgSecondary">{log.action}</TableCell>
                <TableCell className="text-edu-muted max-w-xs truncate">{log.detail}</TableCell>
                <TableCell>
                  <Badge variant={
                    log.type === 'security' ? 'danger' : 
                    log.type === 'billing' ? 'success' : 
                    log.type === 'create' ? 'info' : 'muted'
                  }>
                    {log.type.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
