'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Package, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllTransactions, usePlans, useDeletePlan, SubscriptionPlanDto } from '@/hooks/queries/useSubscriptions';
import { PlanModal } from './_components/PlanModal';
import { toast } from 'react-hot-toast';
import { TransactionTable } from './_components/TransactionTable';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const { data: transactions = [], isLoading: loadingTx } = useAllTransactions();
  const { data: plans = [], isLoading: loadingPlans } = usePlans();
  const deleteMutation = useDeletePlan();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (plan: SubscriptionPlanDto) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói cước này? (Chỉ có thể xóa nếu chưa có trung tâm nào dùng)')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Đã xóa gói cước');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý Gói dịch vụ (SaaS)</h2>
          <p className="text-edu-muted text-sm">Cấu hình các gói cước và theo dõi doanh thu từ các Trung tâm</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-edu-accent hover:bg-blue-700">
          <Plus size={18} />
          Tạo Gói Mới
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-edu-fg mb-4">Danh sách Gói Cước</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingPlans ? (
            <div className="col-span-3 text-center py-5 text-edu-muted">Đang tải danh sách gói...</div>
          ) : plans.map((plan: any) => (
            <div key={plan.id} className="bg-white rounded-2xl p-6 border border-edu-border shadow-sm flex flex-col relative">
              <div className="absolute top-4 right-4 text-edu-accent/20"><Package size={48} /></div>
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xl font-bold text-edu-fg">{plan.name}</h3>
                 <div className="flex items-center gap-2">
                   <Badge variant={plan.status === 'ACTIVE' ? 'success' : 'danger'}>{plan.status}</Badge>
                   <button onClick={() => handleEdit(plan)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={16}/></button>
                   <button onClick={() => handleDelete(plan.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                 </div>
              </div>
              <div className="text-edu-muted text-sm mb-4 line-clamp-2">{plan.description || 'Không có mô tả'}</div>
              <div className="mt-auto pt-4 border-t border-edu-border flex justify-between items-end">
                <div>
                  <div className="text-sm font-semibold text-edu-fgSecondary">Giới hạn User</div>
                  <div className="font-bold">{plan.maxUsers} Users</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-edu-muted">Giá tháng</div>
                  <div className="font-bold text-edu-accent">{plan.pricePerMonth.toLocaleString()} đ</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-10 mb-4">
        <h3 className="text-lg font-bold text-edu-fg">Lịch sử Hóa đơn (Toàn hệ thống)</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
            <Input placeholder="Tìm mã hóa đơn, mã trung tâm..." className="pl-9 h-9 text-sm w-64" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white">
            <Filter size={16} className="text-edu-muted" />
          </Button>
        </div>
      </div>

      <TransactionTable transactions={transactions} isLoading={loadingTx} />
    </div>
  );
}
