import { X, Loader2 } from 'lucide-react';
import { usePromotionHistory, PromotionUsageDto } from '@/hooks/queries/useSubscriptions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PromotionHistoryModalProps {
  promotionId: string;
  onClose: () => void;
}

export function PromotionHistoryModal({ promotionId, onClose }: PromotionHistoryModalProps) {
  const { data: history = [], isLoading } = usePromotionHistory(promotionId);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            Lịch sử sử dụng mã giảm giá
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Mã Hóa đơn</TableHead>
                <TableHead>Trung tâm sử dụng</TableHead>
                <TableHead>Gói dịch vụ</TableHead>
                <TableHead>Thực thu (VNĐ)</TableHead>
                <TableHead>Ngày áp dụng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 size={24} className="animate-spin text-edu-accent mx-auto" />
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-edu-muted">Chưa có ai sử dụng mã giảm giá này.</TableCell>
                </TableRow>
              ) : history.map((item: PromotionUsageDto) => (
                <TableRow key={item.transactionId}>
                  <TableCell className="font-mono text-sm text-edu-accent">{item.referenceCode}</TableCell>
                  <TableCell className="font-semibold text-edu-fg">{item.organizationName}</TableCell>
                  <TableCell>{item.planName}</TableCell>
                  <TableCell className="font-bold text-gray-800">{item.amountPaid.toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{new Date(item.paymentDate).toLocaleString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
