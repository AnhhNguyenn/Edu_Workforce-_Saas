import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { PromotionDto, useCreatePromotion, useUpdatePromotion } from '@/hooks/queries/useSubscriptions';
import { toast } from 'react-hot-toast';

interface PromotionModalProps {
  promo?: PromotionDto | null;
  onClose: () => void;
}

export function PromotionModal({ promo, onClose }: PromotionModalProps) {
  const isEditing = !!promo;
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

  const [formData, setFormData] = useState({
    code: '',
    type: 'PROMO_CODE',
    discountPercentage: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    maxUses: ''
  });

  useEffect(() => {
    if (promo) {
      setFormData({
        code: promo.code || '',
        type: promo.type || 'PROMO_CODE',
        discountPercentage: promo.discountPercentage || 0,
        startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
        endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
        maxUses: promo.maxUses ? promo.maxUses.toString() : ''
      });
    }
  }, [promo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: promo.id, data: submitData });
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success('Tạo mã giảm giá mới thành công');
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
            {isEditing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại khuyến mãi <span className="text-red-500">*</span></label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-sm">
                <option value="PROMO_CODE">Nhập mã Code</option>
                <option value="AUTO_DISCOUNT">Giảm trực tiếp (Auto)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code {formData.type === 'AUTO_DISCOUNT' && <span className="text-xs text-gray-400">(Có thể bỏ trống)</span>}</label>
              <Input name="code" value={formData.code} onChange={handleChange} required={formData.type === 'PROMO_CODE'} placeholder="Ví dụ: SUMMER26" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">% Giảm giá <span className="text-red-500">*</span></label>
            <Input name="discountPercentage" type="number" min="0" max="100" value={formData.discountPercentage} onChange={handleChange} required placeholder="Ví dụ: 20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày <span className="text-red-500">*</span></label>
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày <span className="text-red-500">*</span></label>
              <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lượt dùng</label>
            <Input name="maxUses" type="number" min="1" value={formData.maxUses} onChange={handleChange} placeholder="Để trống nếu không giới hạn" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Hủy bỏ</Button>
            <Button type="submit" className="bg-edu-accent hover:bg-blue-600 min-w-32" disabled={isPending}>
              {isPending ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? 'Lưu thay đổi' : 'Tạo mã')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
