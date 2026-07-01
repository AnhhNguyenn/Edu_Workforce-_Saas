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

  const translateAction = (action: string) => {
    switch (action) {
      case 'Login Success': return 'Đăng nhập thành công';
      case 'Login Failed': return 'Đăng nhập thất bại';
      case 'Logout': return 'Đăng xuất';
      case 'Password Changed': return 'Đổi mật khẩu';
      default: return action;
    }
  };

  const formatUserAgent = (ua: string) => {
    if (!ua || ua === 'Unknown') return 'Không xác định';
    const lower = ua.toLowerCase();
    if (lower.includes('node') || lower.includes('axios') || lower.includes('postman') || lower.includes('insomnia')) {
      return 'Hệ thống (API)';
    }
    
    let browser = 'Trình duyệt';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    
    let os = 'Thiết bị khác';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    if (browser === 'Trình duyệt' && os === 'Thiết bị khác') return ua.substring(0, 25) + '...';
    return `${browser} trên ${os}`;
  };

  const formatIp = (ip: string) => {
    if (!ip) return 'Không xác định';
    if (ip === '::1' || ip === '127.0.0.1') return `${ip} (Localhost)`;
    return ip;
  };

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
                <TableRow key={log.id} className={isDanger ? 'bg-red-50/50 hover:bg-red-50 transition-colors' : 'hover:bg-gray-50/50 transition-colors'}>
                  <TableCell className="whitespace-nowrap font-medium text-gray-700">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isDanger ? 'danger' : isSuccess ? 'success' : 'info'} className="whitespace-nowrap font-medium">
                      {translateAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-800">{log.userName !== 'Unknown' ? log.userName : 'Không rõ'}</div>
                    <div className={`text-xs mt-0.5 ${isDanger ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {formatIp(log.ipAddress)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex items-center gap-1.5" title={log.userAgent}>
                      <span className="truncate max-w-[150px] md:max-w-[200px]">{formatUserAgent(log.userAgent)}</span>
                    </div>
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
