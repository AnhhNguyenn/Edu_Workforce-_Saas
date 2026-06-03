import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditLogTableProps {
  logs: any[];
  isLoading: boolean;
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-[180px]">Thời gian</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Hành động</TableHead>
            <TableHead>Chi tiết (Đối tượng)</TableHead>
            <TableHead className="w-[150px]">Loại</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-edu-muted">Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-edu-muted">Chưa có nhật ký nào.</TableCell>
            </TableRow>
          ) : logs.map((log, i) => (
            <TableRow key={log.id || i}>
              <TableCell className="text-edu-muted text-xs whitespace-nowrap">
                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
              </TableCell>
              <TableCell className="font-medium text-edu-fg">{log.userId}</TableCell>
              <TableCell className="font-semibold text-edu-fgSecondary">{log.action}</TableCell>
              <TableCell className="text-edu-muted max-w-xs truncate">{log.entityType} ({log.entityId})</TableCell>
              <TableCell>
                <Badge variant={
                  log.action === 'DELETE' ? 'danger' : 
                  log.action === 'CREATE' ? 'success' : 
                  log.action === 'UPDATE' ? 'info' : 'muted'
                }>
                  {log.action}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
