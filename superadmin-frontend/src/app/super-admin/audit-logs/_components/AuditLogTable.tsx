import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface AuditLogTableProps {
  logs: any[];
  isLoading: boolean;
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

export function AuditLogTable({ logs, isLoading, hasFilter, onClearFilter }: AuditLogTableProps) {
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
              <TableCell colSpan={5} className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <EmptyState 
                  hasFilter={hasFilter}
                  onClearFilter={onClearFilter}
                  description="Chưa có nhật ký nào."
                />
              </TableCell>
            </TableRow>
          ) : logs.map((log: any) => (
            <TableRow key={log.id}>
              <TableCell className="text-edu-muted text-xs whitespace-nowrap">
                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
              </TableCell>
              <TableCell className="font-medium text-edu-fg truncate max-w-[200px]" title={`${log.userName} (${log.userEmail})`}>
                <div className="flex flex-col">
                  <span>{log.userName}</span>
                  <span className="text-xs text-edu-muted font-normal">{log.userEmail}</span>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-edu-fgSecondary truncate max-w-[150px]" title={log.action}>{log.action}</TableCell>
              <TableCell className="text-edu-muted truncate max-w-[250px]" title={`${log.entityType} (${log.entityId})`}>{log.entityType} ({log.entityId})</TableCell>
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
