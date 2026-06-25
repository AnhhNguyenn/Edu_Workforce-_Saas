import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Bot, Info, DollarSign, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface AuditLogTableProps {
  logs: any[];
  isLoading: boolean;
  hasFilter?: boolean;
  onClearFilter?: () => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

// JsonDiffViewer Component
const JsonDiffViewer = ({ oldJson, newJson }: { oldJson: string, newJson: string }) => {
  let oldObj: any = {};
  let newObj: any = {};
  
  try { oldObj = oldJson ? JSON.parse(oldJson) : {}; } catch {}
  try { newObj = newJson ? JSON.parse(newJson) : {}; } catch {}

  if (typeof oldObj !== 'object' || typeof newObj !== 'object') {
     return (
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-2 text-red-600 text-xs rounded border border-red-100">{oldJson}</div>
          <div className="bg-green-50 p-2 text-green-600 text-xs rounded border border-green-100">{newJson}</div>
       </div>
     );
  }

  const allKeys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])).sort();

  return (
    <div className="flex flex-col w-full bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-[13px] overflow-x-auto shadow-inner border border-gray-800">
      <div className="mb-2 text-[#569cd6]">{"{"}</div>
      {allKeys.map(key => {
        const oldVal = oldObj[key];
        const newVal = newObj[key];
        
        const oldValStr = oldVal === undefined ? '' : JSON.stringify(oldVal);
        const newValStr = newVal === undefined ? '' : JSON.stringify(newVal);

        const isAdded = oldVal === undefined && newVal !== undefined;
        const isRemoved = oldVal !== undefined && newVal === undefined;
        const isChanged = oldVal !== undefined && newVal !== undefined && oldValStr !== newValStr;
        const isUnchanged = oldVal !== undefined && newVal !== undefined && oldValStr === newValStr;

        if (isUnchanged) {
          return (
             <div key={key} className="flex px-2 hover:bg-[#2a2d2e] py-0.5 rounded transition-colors">
               <span className="w-8 select-none text-[#858585] border-r border-[#404040] mr-4 text-center"> </span>
               <span><span className="text-[#9cdcfe]">"{key}"</span>: {oldValStr},</span>
             </div>
          );
        }

        return (
          <div key={key} className="flex flex-col">
            {(isRemoved || isChanged) && (
              <div className="flex px-2 bg-[#4b1818] py-0.5 w-full">
                <span className="w-8 select-none text-[#f48771] border-r border-[#404040] mr-4 text-center font-bold">-</span>
                <span className="break-all"><span className="text-[#9cdcfe]">"{key}"</span>: <span className="bg-[#6f1313] px-1 rounded">{oldValStr}</span>,</span>
              </div>
            )}
            {(isAdded || isChanged) && (
              <div className="flex px-2 bg-[#123016] py-0.5 w-full">
                <span className="w-8 select-none text-[#89d185] border-r border-[#404040] mr-4 text-center font-bold">+</span>
                <span className="break-all"><span className="text-[#9cdcfe]">"{key}"</span>: <span className="bg-[#1f5c27] px-1 rounded">{newValStr}</span>,</span>
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-2 text-[#569cd6]">{"}"}</div>
    </div>
  );
};

export function AuditLogTable({ 
  logs, 
  isLoading, 
  hasFilter, 
  onClearFilter,
  page = 1,
  totalPages = 1,
  onPageChange
}: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const parseAiData = (newDataStr: string) => {
    try {
      if (!newDataStr) return null;
      return JSON.parse(newDataStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[150px]">Thời gian</TableHead>
              <TableHead className="w-[160px]">Trung tâm</TableHead>
              <TableHead className="w-[180px]">Người dùng</TableHead>
              <TableHead className="w-[130px]">Hành động</TableHead>
              <TableHead>Chi tiết (Payload)</TableHead>
              <TableHead className="w-[120px] text-right">Chi phí</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-edu-muted">
                  <Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
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
                    <div className="font-semibold text-edu-fg text-sm">{log.organizationName || 'Hệ thống'}</div>
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
                        log.action === 'Deleted' || log.action === 'Login Failed' ? 'danger' : 
                        log.action === 'Added' || log.action === 'Login Success' ? 'success' : 
                        log.action === 'Modified' ? 'info' : 'muted'
                      }>
                        {log.action}
                      </Badge>
                    )}
                    {!isAiLog && log.entityType && (
                      <div className="text-xs text-edu-muted mt-1 font-mono bg-gray-50 px-1 py-0.5 rounded inline-block max-w-[120px] truncate" title={log.entityType}>
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
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 line-clamp-2 flex-1" title={log.newData || log.oldData || '-'}>
                          {log.newData ? "Có thay đổi dữ liệu (Nhấn Xem để so sánh)" : "Chỉ ghi nhận sự kiện"}
                        </div>
                        {(log.oldData || log.newData) && (
                          <button 
                            onClick={() => setSelectedLog(log)}
                            className="text-edu-accent hover:text-edu-accentDark flex items-center gap-1 font-medium transition-colors text-sm whitespace-nowrap bg-edu-accentLight/50 px-2 py-1 rounded-md"
                          >
                            <Eye size={14} /> Xem
                          </button>
                        )}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-edu-border flex items-center justify-between bg-gray-50/50">
          <span className="text-sm text-edu-muted">
            Trang <span className="font-medium text-edu-fg">{page}</span> / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="bg-white"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="bg-white"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)}
        title="Trình so sánh mã (Diff Viewer)"
        className="max-w-4xl"
      >
        <p className="text-sm text-edu-muted mb-4">
          Cơ sở: <span className="font-semibold text-edu-fg">{selectedLog?.organizationName || 'Hệ thống'}</span> | 
          Đối tượng: <span className="font-semibold text-edu-fg ml-1">{selectedLog?.entityType}</span>
        </p>
        
        <div className="mt-2 rounded-xl overflow-hidden shadow-xl border border-gray-700 bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
             <span className="text-xs font-semibold text-gray-300">File Diff: {selectedLog?.entityType}.json</span>
             <div className="flex gap-4 text-[11px]">
                <span className="text-red-400 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Đã xóa</span>
                <span className="text-green-400 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Đã thêm/Sửa</span>
             </div>
          </div>
          <JsonDiffViewer oldJson={selectedLog?.oldData} newJson={selectedLog?.newData} />
        </div>
      </Modal>
    </div>
  );
}
