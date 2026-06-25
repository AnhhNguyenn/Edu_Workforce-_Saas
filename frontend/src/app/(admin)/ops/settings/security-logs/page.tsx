'use client';

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, ShieldAlert } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/audit-logs?type=security&pageSize=100');
        setLogs(res.data.items || []);
      } catch (err) {
        console.error("Failed to load security logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="w-full space-y-7">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-edu-fg flex items-center gap-2">
          <ShieldAlert className="text-edu-danger" /> Nhật ký Bảo mật (Security Logs)
        </h2>
        <p className="text-edu-muted text-sm">Theo dõi các lượt đăng nhập, đổi mật khẩu và phát hiện truy cập trái phép</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-edu-muted bg-white rounded-2xl border border-edu-border shadow-sm">
          <Loader2 className="animate-spin mr-2" size={24} /> Đang tải dữ liệu...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-edu-muted bg-white rounded-2xl border border-edu-border shadow-sm">
          Không có sự kiện bảo mật nào.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Tài khoản (Email)</TableHead>
              <TableHead>Địa chỉ IP</TableHead>
              <TableHead>Thiết bị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              let email = log.userEmail;
              if (log.newData) {
                try {
                  const data = JSON.parse(log.newData);
                  if (data.Email) email = data.Email;
                } catch {}
              }

              const isDanger = log.action === 'Login Failed';
              const isSuccess = log.action === 'Login Success';
              
              return (
                <TableRow key={log.id} className={isDanger ? 'bg-edu-dangerLight/30 hover:bg-edu-dangerLight' : ''}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isDanger ? 'danger' : isSuccess ? 'success' : 'info'}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-edu-fg">{log.userName !== 'Unknown' ? log.userName : ''}</div>
                    <div className={`text-xs ${isDanger ? 'text-edu-danger font-medium' : 'text-edu-muted'}`}>{email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-edu-fgSecondary">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell className="text-xs text-edu-muted max-w-[200px] truncate" title={log.userAgent}>
                    {log.userAgent}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
