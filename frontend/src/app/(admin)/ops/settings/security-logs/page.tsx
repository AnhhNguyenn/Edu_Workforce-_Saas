'use client';

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, ShieldAlert } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'security',
        pageSize: '20',
        pageNumber: page.toString()
      });
      if (keyword) params.append('keyword', keyword);
      if (actionFilter) params.append('action', actionFilter);
      if (startDate) params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) params.append('endDate', format(endDate, 'yyyy-MM-dd'));

      const res = await apiClient.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load security logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

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

      <div className="bg-white p-4 rounded-xl border border-edu-border shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Tìm kiếm (Tên, Email)</label>
          <Input 
            type="text" 
            placeholder="Nhập từ khóa..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>
        <div className="w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Sự kiện</label>
          <Select 
            options={[
              { value: "", label: "Tất cả" },
              { value: "Login Success", label: "Đăng nhập thành công" },
              { value: "Login Failed", label: "Đăng nhập thất bại" },
              { value: "Logout", label: "Đăng xuất" },
              { value: "Password Changed", label: "Đổi mật khẩu" }
            ]}
            value={actionFilter}
            onChange={(value) => setActionFilter(value)}
          />
        </div>
        <div className="w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
          <DatePicker 
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="dd/mm/yyyy"
          />
        </div>
        <div className="w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
          <DatePicker 
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="dd/mm/yyyy"
          />
        </div>
        <Button 
          variant="primary"
          onClick={handleFilter}
        >
          Lọc dữ liệu
        </Button>
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
        <>
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
                    const parsed = JSON.parse(log.newData);
                    if (parsed.Email) email = parsed.Email;
                  } catch (e) {}
                }
                
                const isFailed = log.action === 'Login Failed';
                
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isFailed ? 'danger' : 'success'}>
                        {translateAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-edu-fg">{log.userName || 'Không xác định'}</div>
                      <div className={`text-xs ${isFailed ? 'text-edu-danger font-medium' : 'text-edu-muted'}`}>{email}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {formatIp(log.ipAddress)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-edu-fg">
                        {formatUserAgent(log.userAgent)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              <span className="text-sm font-medium text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
