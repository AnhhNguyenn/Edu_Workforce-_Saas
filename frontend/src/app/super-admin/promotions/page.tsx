'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePromotions, useDeletePromotion, PromotionDto } from '@/hooks/queries/useSubscriptions';
import { PromotionModal } from './_components/PromotionModal';
import { PromotionHistoryModal } from './_components/PromotionHistoryModal';
import { toast } from 'react-hot-toast';

export default function PromotionsPage() {
  const { data: promotions = [], isLoading } = usePromotions();
  const deleteMutation = useDeletePromotion();

  const [selectedPromo, setSelectedPromo] = useState<PromotionDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [historyPromoId, setHistoryPromoId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedPromo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (promo: PromotionDto) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };

  const handleHistory = (id: string) => {
    setHistoryPromoId(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Đã xóa mã giảm giá');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Mã giảm giá (Promotions)</h2>
          <p className="text-edu-muted text-sm">Quản lý các chương trình khuyến mãi và mã giảm giá gói cước</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-edu-accent hover:bg-blue-700">
          <Plus size={18} />
          Tạo Mã Mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Mã Code</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giảm giá (%)</TableHead>
              <TableHead>Lượt dùng</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-edu-muted">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-edu-muted">Chưa có mã giảm giá nào.</TableCell>
              </TableRow>
            ) : promotions.map((promo: PromotionDto) => (
              <TableRow key={promo.id}>
                <TableCell className="font-bold text-edu-fg">{promo.code || '(Tự động giảm)'}</TableCell>
                <TableCell>
                  <Badge variant="muted" className="bg-gray-50 border border-gray-200">{promo.type === 'AUTO_DISCOUNT' ? 'Giảm trực tiếp' : 'Nhập mã code'}</Badge>
                </TableCell>
                <TableCell className="font-semibold text-edu-accent">{promo.discountPercentage}%</TableCell>
                <TableCell>
                  {promo.currentUses} / {promo.maxUses ? promo.maxUses : '∞'}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <Badge variant={promo.status === 'ACTIVE' ? 'success' : 'danger'}>{promo.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleHistory(promo.id)} title="Lịch sử dùng" className="text-purple-600 hover:bg-purple-50 p-1.5 rounded"><History size={16}/></button>
                    <button onClick={() => handleEdit(promo)} title="Sửa" className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(promo.id)} title="Xóa" className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && <PromotionModal promo={selectedPromo} onClose={() => setIsModalOpen(false)} />}
      {historyPromoId && <PromotionHistoryModal promotionId={historyPromoId} onClose={() => setHistoryPromoId(null)} />}
    </div>
  );
}
