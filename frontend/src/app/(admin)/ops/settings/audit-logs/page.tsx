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

  const formatJson = (jsonStr: string) => {
    if (!jsonStr) return "Không có dữ liệu";
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
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
        <p className="text-sm text-edu-muted mb-4">
          So sánh dữ liệu trước và sau khi thay đổi của <span className="font-semibold text-edu-fg">{selectedLog?.entityType}</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-edu-danger mb-2">Trước khi sửa (Before)</h4>
            <pre className="bg-edu-dangerLight p-4 rounded-lg text-xs overflow-x-auto text-edu-danger border border-red-100 whitespace-pre-wrap max-h-[500px]">
              {formatJson(selectedLog?.oldData)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-edu-success mb-2">Sau khi sửa (After)</h4>
            <pre className="bg-edu-successLight p-4 rounded-lg text-xs overflow-x-auto text-edu-success border border-green-100 whitespace-pre-wrap max-h-[500px]">
              {formatJson(selectedLog?.newData)}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}
