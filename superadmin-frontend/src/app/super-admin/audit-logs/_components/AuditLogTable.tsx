import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Bot, Info, DollarSign } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface AuditLogTableProps {
  logs: any[];
  isLoading: boolean;
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

export function AuditLogTable({ logs, isLoading, hasFilter, onClearFilter }: AuditLogTableProps) {
  const parseAiData = (newDataStr: string) => {
    try {
      if (!newDataStr) return null;
      return JSON.parse(newDataStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-[160px]">Thời gian</TableHead>
            <TableHead className="w-[180px]">Người dùng</TableHead>
            <TableHead className="w-[150px]">Module / Loại</TableHead>
            <TableHead>Chi tiết (Payload)</TableHead>
            <TableHead className="w-[150px] text-right">Chi phí</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-edu-muted">
                <Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...
              </TableCell>
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
          ) : logs.map((log: any) => {
            const isAiLog = log.action === 'AI_USAGE_LOG';
            const aiData = isAiLog ? parseAiData(log.newData) : null;
            
            return (
              <TableRow key={log.id} className="hover:bg-gray-50/30">
                <TableCell className="text-edu-muted text-xs whitespace-nowrap align-top pt-4">
                  {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                </TableCell>
                <TableCell className="align-top pt-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-edu-fg text-sm">{log.userName || 'Hệ thống'}</span>
                    <span className="text-xs text-edu-muted font-normal">{log.userEmail || '-'}</span>
                    {log.ipAddress && <span className="text-[10px] text-gray-400 mt-1 uppercase">IP: {log.ipAddress}</span>}
                  </div>
                </TableCell>
                <TableCell className="align-top pt-4">
                  {isAiLog ? (
                    <Badge variant="info" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none gap-1 py-1">
                      <Bot size={12} /> AI Usage
                    </Badge>
                  ) : (
                    <Badge variant={
                      log.action === 'DELETE' ? 'danger' : 
                      log.action === 'CREATE' ? 'success' : 
                      log.action === 'UPDATE' ? 'warn' : 'muted'
                    }>
                      {log.action}
                    </Badge>
                  )}
                  {!isAiLog && (
                    <div className="text-xs text-edu-muted mt-1 font-mono bg-gray-50 px-1 py-0.5 rounded inline-block">
                      {log.entityType}
                    </div>
                  )}
                </TableCell>
                <TableCell className="align-top pt-4">
                  {isAiLog && aiData ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-edu-fg">{aiData.Provider}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{aiData.Model}</span>
                      </div>
                      <div className="flex gap-4 text-xs mt-1">
                        <div className="flex flex-col">
                          <span className="text-gray-400">Tokens In (Hit)</span>
                          <span className="font-medium text-green-600">{aiData.HitTokens?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400">Tokens In (Miss)</span>
                          <span className="font-medium text-orange-500">{aiData.MissTokens?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400">Tokens Out</span>
                          <span className="font-medium text-blue-600">{aiData.OutputTokens?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 line-clamp-2" title={log.newData || log.oldData || '-'}>
                      {log.newData || log.oldData || <span className="italic opacity-50">Không có dữ liệu chi tiết</span>}
                    </div>
                  )}
                </TableCell>
                <TableCell className="align-top pt-4 text-right">
                  {isAiLog && aiData ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                        <DollarSign size={14} className="mr-0.5"/> 
                        {aiData.TotalCost ? aiData.TotalCost.toFixed(6) : '0.000000'}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">{aiData.Currency || 'USD'}</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
