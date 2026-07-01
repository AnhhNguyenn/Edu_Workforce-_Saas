'use client';

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Eye } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/audit-logs?type=audit&pageSize=100');
        setLogs(res.data.items || []);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const fieldNames: Record<string, string> = {
    Amount: "Số tiền",
    MonthsToAdd: "Thời hạn (Tháng)",
    PlanName: "Gói dịch vụ",
    PaymentMethod: "Phương thức TT",
    StatusId: "Mã trạng thái",
    PaymentDate: "Ngày thanh toán",
    ReferenceCode: "Mã tham chiếu",
    FullName: "Họ và tên",
    PhoneNumber: "Số điện thoại",
    Email: "Email",
    Role: "Vai trò",
    Name: "Tên",
    Description: "Mô tả",
    IsActive: "Trạng thái",
    Price: "Giá",
  };

  const ignoredFields = [
    'Id', 'OrganizationId', 'CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt', 
    'DeletedBy', 'DeletedAt', 'Version', 'PlanId', 'PromotionId', 'SePayTransactionId', 
    'UserId', 'NormalizedEmail', 'NormalizedUserName', 'SecurityStamp', 'ConcurrencyStamp', 'PasswordHash'
  ];

  const parseJson = (str: string) => {
    if (!str) return {};
    try {
      return JSON.parse(str) || {};
    } catch {
      return {};
    }
  };

  const renderDiffTable = (oldStr: string, newStr: string) => {
    const oldObj = parseJson(oldStr);
    const newObj = parseJson(newStr);
    
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
      .filter(key => !ignoredFields.includes(key));

    const diffKeys = allKeys.filter(key => oldObj[key] !== newObj[key]);

    if (diffKeys.length === 0) {
      return <div className="text-gray-500 italic p-6 text-center bg-gray-50 rounded-xl border border-gray-100">Không có thay đổi dữ liệu nào đáng kể được ghi nhận.</div>;
    }

    return (
      <div className="w-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Trường dữ liệu</th>
                <th className="px-4 py-3 font-semibold text-red-600 w-2/5">Trước khi thay đổi</th>
                <th className="px-4 py-3 font-semibold text-green-600 w-2/5">Sau khi thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {diffKeys.map(key => {
                const oldVal = oldObj[key];
                const newVal = newObj[key];
                const displayKey = fieldNames[key] || key;
                
                const formatVal = (val: any) => {
                  if (val === null || val === undefined) return <span className="text-gray-400 italic">Trống</span>;
                  if (typeof val === 'boolean') return val ? 'Có' : 'Không';
                  if (typeof val === 'object') return JSON.stringify(val);
                  if (typeof val === 'string' && val.includes('T') && val.endsWith('Z')) {
                    try { return format(new Date(val), "dd/MM/yyyy HH:mm"); } catch { return val; }
                  }
                  return String(val);
                };

                return (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">{displayKey}</td>
                    <td className="px-4 py-3 text-red-600 bg-red-50/50">
                       <div className="line-through opacity-80 break-words whitespace-pre-wrap">{formatVal(oldVal)}</div>
                    </td>
                    <td className="px-4 py-3 text-green-700 bg-green-50/50 font-medium">
                       <div className="break-words whitespace-pre-wrap">{formatVal(newVal)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'Added': return 'success';
      case 'Modified': return 'info';
      case 'Deleted': return 'danger';
      default: return 'muted';
    }
  };

  return (
    <div className="w-full space-y-7">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Nhật ký Hoạt động (Audit Logs)</h2>
        <p className="text-edu-muted text-sm">Theo dõi mọi thay đổi dữ liệu trong trung tâm của bạn</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-edu-muted">
          <Loader2 className="animate-spin mr-2" size={24} /> Đang tải dữ liệu...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-edu-muted">
          Không có nhật ký hoạt động nào.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-edu-fg">{log.userName}</div>
                  <div className="text-xs text-edu-muted">{log.userEmail}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-edu-fg">{log.entityType}</div>
                  <div className="text-xs text-edu-muted truncate max-w-[150px]" title={log.entityId}>{log.entityId}</div>
                </TableCell>
                <TableCell>
                  {(log.oldData || log.newData) && (
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-edu-accent hover:text-edu-accentDark flex items-center gap-1 font-medium transition-colors"
                    >
                      <Eye size={16} /> Xem
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)}
        title="Chi tiết thay đổi"
        className="max-w-4xl"
      >
        <p className="text-sm text-edu-muted mb-2">
          Hệ thống đang hiển thị so sánh dữ liệu bị thay đổi của <span className="font-semibold text-edu-fg bg-gray-100 px-2 py-0.5 rounded">{selectedLog?.entityType}</span>
        </p>
        
        {renderDiffTable(selectedLog?.oldData, selectedLog?.newData)}
      </Modal>
    </div>
  );
}
