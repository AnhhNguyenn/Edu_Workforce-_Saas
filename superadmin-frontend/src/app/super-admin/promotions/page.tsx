'use client';

import { useState } from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePromotions, useDeletePromotion, PromotionDto } from '@/hooks/queries/useSubscriptions';
import { PromotionModal } from './_components/PromotionModal';
import { PromotionHistoryModal } from './_components/PromotionHistoryModal';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/providers/ConfirmProvider';

import { FeatureGuard } from '@/components/ui/feature-guard';

export default function PromotionsPage() {
  const { data: promotions = [], isLoading } = usePromotions();
  const deleteMutation = useDeletePromotion();

  const [selectedPromo, setSelectedPromo] = useState<PromotionDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyPromoId, setHistoryPromoId] = useState<string | null>(null);
  const { confirm } = useConfirm();

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

  const handleDeleteClick = (promoId: string) => {
    confirm({
      title: "Xác nhận xóa Mã giảm giá",
      description: "Bạn có chắc chắn muốn xóa mã giảm giá này không? Hành động này không thể hoàn tác.",
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(promoId);
          toast.success('Đã xóa mã giảm giá');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
      }
    });
  };

  return (
    <FeatureGuard featureKey="FEATURE_PROMOTIONS">
      <div className="max-w-7xl mx-auto space-y-7">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-edu-fg">Mã giảm giá (Promotions)</h2>
            <p className="text-edu-muted text-sm">Quản lý các chương trình khuyến mãi và mã giảm giá gói cước</p>
          </div>
          <CreateButton onClick={handleCreate} label="Tạo Mã Mới" />
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
                  <TableCell colSpan={7} className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState description="Chưa có mã giảm giá nào." />
                  </TableCell>
                </TableRow>
              ) : promotions.map((promo: PromotionDto) => (
                <TableRow key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-bold text-edu-fg truncate max-w-[150px]" title={promo.code || '(Tự động giảm)'}>{promo.code || '(Tự động giảm)'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="muted" className="bg-gray-50 border border-gray-200 w-fit">
                        {promo.type === 'AUTO_DISCOUNT' ? 'Giảm trực tiếp' : 'Nhập mã code'}
                      </Badge>
                      {promo.type === 'AUTO_DISCOUNT' && (
                        <span className="text-xs text-edu-muted mt-1 truncate max-w-[150px]">
                          Áp dụng: {promo.subscriptionPlanName || 'Gói chưa xác định'}
                        </span>
                      )}
                    </div>
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
                    <div className="flex justify-end">
                      <ActionButtons
                        onEdit={() => handleEdit(promo)}
                        onDelete={() => handleDeleteClick(promo.id)}
                      >
                        <Button variant="ghost" size="icon" onClick={() => handleHistory(promo.id)} title="Lịch sử dùng" className="h-7 w-7 text-purple-600 hover:bg-purple-50 hover:text-purple-700"><History size={14}/></Button>
                      </ActionButtons>
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
    </FeatureGuard>
  );
}
