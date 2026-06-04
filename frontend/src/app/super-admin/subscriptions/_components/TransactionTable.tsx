import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TransactionTableProps {
  transactions: any[];
  isLoading: boolean;
}

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead>Mã Giao Dịch</TableHead>
            <TableHead>Tổ chức (Khách hàng)</TableHead>
            <TableHead>Gói cước</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Ngày thanh toán</TableHead>
            <TableHead className="w-[150px]">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-edu-muted">Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-edu-muted">Chưa có giao dịch nào.</TableCell>
            </TableRow>
          ) : transactions.map((inv: any) => (
            <TableRow key={inv.id}>
              <TableCell className="font-semibold text-edu-fg">{inv.referenceCode}</TableCell>
              <TableCell className="font-medium">{inv.organizationId}</TableCell>
              <TableCell className="text-edu-fgSecondary">{inv.planName || 'Gói Dịch Vụ'}</TableCell>
              <TableCell className="font-bold text-edu-accent">{inv.amount?.toLocaleString('vi-VN')} đ</TableCell>
              <TableCell className="text-edu-muted">{format(new Date(inv.transactionDate || new Date()), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>
                <Badge variant={inv.status === 'PAID' ? 'success' : 'warn'}>
                  {inv.status === 'PAID' ? 'Đã thanh toán' : 'Chờ xử lý'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
