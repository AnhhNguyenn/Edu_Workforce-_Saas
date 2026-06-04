import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Loader2 } from 'lucide-react';
import { SubscriptionPlanDto, useCreatePlan, useUpdatePlan } from '@/hooks/queries/useSubscriptions';
import { toast } from 'react-hot-toast';

interface PlanModalProps {
  plan?: SubscriptionPlanDto | null;
  onClose: () => void;
}

export function PlanModal({ plan, onClose }: PlanModalProps) {
  const isEditing = !!plan;
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxUsers: 50,
    pricePerMonth: 0,
    pricePerYear: 0
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        maxUsers: plan.maxUsers || 50,
        pricePerMonth: plan.pricePerMonth || 0,
        pricePerYear: plan.pricePerYear || 0
      });
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numFields = ['maxUsers', 'pricePerMonth', 'pricePerYear'];
    setFormData(prev => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: plan.id, data: formData });
        toast.success('Cập nhật gói cước thành công');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Tạo gói cước mới thành công');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Sửa gói cước' : 'Tạo gói cước mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Tên gói cước <span className="text-red-500">*</span></Label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Ví dụ: Gói Cơ Bản" />
          </div>

          <div className="space-y-2">
            <Label>Mô tả ngắn gọn</Label>
            <Input name="description" value={formData.description} onChange={handleChange} placeholder="Phù hợp cho trung tâm nhỏ..." />
          </div>

          <div className="space-y-2">
            <Label>Giới hạn số lượng tài khoản (Users) <span className="text-red-500">*</span></Label>
            <Input name="maxUsers" type="number" min="1" value={formData.maxUsers} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giá 1 Tháng (VNĐ) <span className="text-red-500">*</span></Label>
              <Input name="pricePerMonth" type="number" min="0" value={formData.pricePerMonth} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Giá 1 Năm (VNĐ) <span className="text-red-500">*</span></Label>
              <Input name="pricePerYear" type="number" min="0" value={formData.pricePerYear} onChange={handleChange} required />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
            <Button type="submit" className="bg-edu-accent hover:bg-blue-600 min-w-32" disabled={isPending}>
              {isPending ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? 'Lưu thay đổi' : 'Tạo gói')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
