import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface TransactionTableProps {
  transactions: any[];
  isLoading: boolean;
  searchTerm?: string;
  onClearSearch?: () => void;
}

export function TransactionTable({ transactions, isLoading, searchTerm, onClearSearch }: TransactionTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead>Mã Giao Dịch</TableHead>
            <TableHead>Tổ chức (Khách hàng)</TableHead>
            <TableHead>Gói cước</TableHead>
            <TableHead>Mã giảm giá</TableHead>
            <TableHead>Gốc / Thực thu</TableHead>
            <TableHead>Ngày thanh toán</TableHead>
            <TableHead className="w-[150px]">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState 
                  hasFilter={!!searchTerm}
                  onClearFilter={onClearSearch}
                  description="Chưa có giao dịch nào."
                />
              </TableCell>
            </TableRow>
          ) : transactions.map((inv: any) => (
            <TableRow key={inv.id}>
              <TableCell className="font-semibold text-edu-fg truncate max-w-[150px]" title={inv.referenceCode}>{inv.referenceCode}</TableCell>
              <TableCell className="font-medium truncate max-w-[200px]" title={inv.organizationName}>{inv.organizationName}</TableCell>
              <TableCell className="text-edu-fgSecondary truncate max-w-[150px]" title={inv.planName}>{inv.planName || 'Gói Dịch Vụ'}</TableCell>
              <TableCell>
                {inv.promotionCode ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 uppercase">{inv.promotionCode}</Badge>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {inv.originalAmount > inv.amount && (
                  <div className="text-xs text-gray-400 line-through mb-0.5">{inv.originalAmount.toLocaleString('vi-VN')} đ</div>
                )}
                <div className="font-bold text-edu-accent">{inv.amount?.toLocaleString('vi-VN')} đ</div>
              </TableCell>
              <TableCell className="text-edu-muted">{format(new Date(inv.paymentDate || new Date()), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>
                <Badge variant={inv.status === 'SUCCESS' ? 'success' : inv.status === 'FAILED' ? 'danger' : 'warn'}>
                  {inv.status === 'SUCCESS' ? 'Đã thanh toán' : inv.status === 'FAILED' ? 'Thất bại' : 'Chờ xử lý'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}