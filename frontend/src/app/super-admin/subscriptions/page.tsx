'use client';

import { useState } from 'react';
import { Search, Filter, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Input } from '@/components/ui/input';
import { useAllTransactions, usePlans, useDeletePlan, SubscriptionPlanDto } from '@/hooks/queries/useSubscriptions';
import { PlanModal } from './_components/PlanModal';
import { toast } from 'react-hot-toast';
import { TransactionTable } from './_components/TransactionTable';
import { Badge } from '@/components/ui/badge';
import { useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/providers/ConfirmProvider';

export default function SubscriptionsPage() {
  const { data: transactions = [], isLoading: loadingTx } = useAllTransactions();
  const { data: plans = [], isLoading: loadingPlans } = usePlans();
  const deleteMutation = useDeletePlan();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { confirm } = useConfirm();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredTransactions = useMemo(() => {
    if (!debouncedSearch) return transactions;
    return transactions.filter((tx: any) => 
      tx.referenceCode?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      tx.organizationName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      tx.planName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [transactions, debouncedSearch]);

  const handleEdit = (plan: SubscriptionPlanDto) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (planId: string) => {
    confirm({
      title: "Xác nhận xóa Gói cước",
      description: "Bạn có chắc chắn muốn xóa gói cước này? (Chỉ có thể xóa nếu chưa có trung tâm nào dùng). Hành động này không thể hoàn tác.",
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(planId);
          toast.success('Đã xóa gói cước');
          setSelectedPlanIds(prev => prev.filter(id => id !== planId));
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
      }
    });
  };

  const handleBulkDeleteClick = () => {
    if (selectedPlanIds.length === 0) return;
    confirm({
      title: `Xóa ${selectedPlanIds.length} gói cước`,
      description: `Bạn đang chuẩn bị xóa ${selectedPlanIds.length} gói cước cùng lúc. Các gói đang được Trung tâm sử dụng sẽ bị bỏ qua và không bị xóa. Hành động này không thể hoàn tác.`,
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await Promise.all(selectedPlanIds.map(id => deleteMutation.mutateAsync(id)));
          toast.success(`Đã xóa thành công ${selectedPlanIds.length} gói cước`);
          setSelectedPlanIds([]);
        } catch (error: any) {
          toast.error('Có lỗi xảy ra. Không thể xóa các gói đang được Trung tâm sử dụng.');
          setSelectedPlanIds([]);
        }
      }
    });
  };

  const toggleSelectPlan = (id: string) => {
    setSelectedPlanIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Quản lý Gói dịch vụ (SaaS)</h2>
          <p className="text-edu-muted text-sm">Cấu hình các gói cước và theo dõi doanh thu từ các Trung tâm</p>
        </div>
        <CreateButton onClick={handleCreate} label="Tạo Gói Mới" />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-edu-fg">Danh sách Gói Cước</h3>
          {selectedPlanIds.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-full border border-red-100 animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium text-red-700">Đã chọn {selectedPlanIds.length} gói</span>
              <Button size="sm" variant="danger" onClick={handleBulkDeleteClick} className="h-7 text-xs">
                <Trash2 size={14} className="mr-1" />
                Xóa tất cả
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPlanIds([])} className="h-7 text-xs text-red-600 hover:bg-red-100">Hủy</Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingPlans ? (
            <div className="col-span-3 text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải danh sách gói...</div>
          ) : plans.length === 0 ? (
            <div className="col-span-3">
              <EmptyState description="Chưa có gói cước nào được tạo." />
            </div>
          ) : plans.map((plan: any) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col relative cursor-pointer transition-all ${selectedPlanIds.includes(plan.id) ? 'border-red-400 ring-2 ring-red-100' : 'border-edu-border hover:border-gray-300'}`}
              onClick={() => toggleSelectPlan(plan.id)}
            >
              <div className="absolute top-4 right-4 text-edu-accent/20"><Package size={48} /></div>
              
              <div className="flex justify-between items-start mb-2 relative z-10">
                 <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                   <div 
                     className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center mt-1 transition-colors ${selectedPlanIds.includes(plan.id) ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'}`}
                   >
                     {selectedPlanIds.includes(plan.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                   </div>
                   <div className="flex flex-col items-start min-w-0 w-full">
                     <h3 className="text-xl font-bold text-edu-fg truncate w-full" title={plan.name}>{plan.name}</h3>
                     <Badge className="mt-1" variant={plan.status === 'ACTIVE' ? 'success' : 'danger'}>{plan.status}</Badge>
                   </div>
                 </div>
                 <div className="flex shrink-0 items-center">
                   <ActionButtons 
                     onEdit={() => handleEdit(plan)}
                     onDelete={() => handleDeleteClick(plan.id)}
                   />
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
                  <div className="font-bold text-edu-accent whitespace-nowrap">{plan.pricePerMonth.toLocaleString()} đ</div>
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
            <Input 
              placeholder="Tìm mã hóa đơn, mã trung tâm..." 
              className="pl-9 h-9 text-sm w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white">
            <Filter size={16} className="text-edu-muted" />
          </Button>
        </div>
      </div>

      <TransactionTable transactions={filteredTransactions} isLoading={loadingTx} searchTerm={searchTerm} onClearSearch={() => setSearchTerm('')} />

      {isModalOpen && (
        <PlanModal 
          onClose={() => setIsModalOpen(false)} 
          plan={selectedPlan} 
        />
      )}
    </div>
  );
}
