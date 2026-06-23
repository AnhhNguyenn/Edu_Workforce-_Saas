'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBroadcasts, useCreateBroadcast, useUpdateBroadcast, useDeleteBroadcast, useSendBroadcast, useRecallBroadcast } from '@/hooks/queries/useBroadcasts';
import { format } from 'date-fns';
import { Megaphone, Plus, Send, Edit, Trash, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BroadcastsPage() {
  const { data: broadcastsData, isLoading } = useBroadcasts(1, 100);
  const broadcasts = broadcastsData?.items || [];

  const createMutation = useCreateBroadcast();
  const updateMutation = useUpdateBroadcast();
  const deleteMutation = useDeleteBroadcast();
  const sendMutation = useSendBroadcast();
  const recallMutation = useRecallBroadcast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: '',
      message: '',
      type: 'info',
      actionLink: '',
      targetRoles: '',
      targetPercentage: 100
    }
  });

  const onSubmit = (data: any) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast.success('Cập nhật bản tin thành công');
          closeModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật')
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Tạo bản tin thành công');
          closeModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo mới')
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset();
  };

  const openEdit = (b: any) => {
    setEditingId(b.id);
    setValue('title', b.title);
    setValue('message', b.message);
    setValue('type', b.type);
    setValue('actionLink', b.actionLink || '');
    setValue('targetRoles', b.targetRoles || '');
    setValue('targetPercentage', b.targetPercentage);
    setIsModalOpen(true);
  };

  const handleSend = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn phát sóng thông báo này tới người dùng?')) {
      sendMutation.mutate(id, {
        onSuccess: () => toast.success('Phát sóng thành công!'),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi phát sóng')
      });
    }
  };

  const handleRecall = (id: string) => {
    if (confirm('Xác nhận thu hồi bản tin này khỏi tất cả người dùng?')) {
      recallMutation.mutate(id, {
        onSuccess: () => toast.success('Thu hồi thành công!'),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi thu hồi')
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa vĩnh viễn bản tin này?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Xóa thành công!'),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa')
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-edu-fg">Phát sóng Thông báo (System Broadcast)</h1>
          <p className="text-edu-muted mt-1">Quản lý và gửi thông báo hệ thống đến toàn bộ hoặc một nhóm người dùng.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-edu-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-edu-primary/90 transition"
        >
          <Plus size={18} /> Tạo mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-edu-border text-sm text-edu-muted">
            <tr>
              <th className="p-4 font-medium">Tiêu đề</th>
              <th className="p-4 font-medium">Đối tượng</th>
              <th className="p-4 font-medium">Tỷ lệ</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-edu-muted">Đang tải...</td></tr>
            ) : broadcasts.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-edu-muted">Chưa có bản tin nào</td></tr>
            ) : (
              broadcasts.map(b => (
                <tr key={b.id} className="border-b border-edu-border hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold text-edu-fg">{b.title}</div>
                    <div className="text-edu-muted text-xs line-clamp-1">{b.message}</div>
                  </td>
                  <td className="p-4 text-edu-fg">
                    {b.targetRoles ? <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{b.targetRoles}</span> : 'Tất cả (All)'}
                  </td>
                  <td className="p-4 text-edu-fg font-medium">{b.targetPercentage}%</td>
                  <td className="p-4">
                    {b.isRecalled ? (
                      <span className="text-edu-danger bg-edu-dangerLight px-2 py-1 rounded-full text-xs font-semibold">Đã thu hồi</span>
                    ) : b.isSent ? (
                      <span className="text-edu-success bg-edu-successLight px-2 py-1 rounded-full text-xs font-semibold">Đã phát sóng</span>
                    ) : (
                      <span className="text-edu-warn bg-edu-warnLight px-2 py-1 rounded-full text-xs font-semibold">Bản nháp</span>
                    )}
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {!b.isSent && (
                      <>
                        <button onClick={() => openEdit(b)} className="p-2 text-edu-accent hover:bg-edu-accentLight rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleSend(b.id)} className="p-2 text-edu-success hover:bg-edu-successLight rounded-lg" title="Phát sóng"><Send size={16} /></button>
                      </>
                    )}
                    {b.isSent && !b.isRecalled && (
                      <button onClick={() => handleRecall(b.id)} className="p-2 text-edu-warn hover:bg-edu-warnLight rounded-lg" title="Thu hồi"><RotateCcw size={16} /></button>
                    )}
                    {(!b.isSent || b.isRecalled) && (
                      <button onClick={() => handleDelete(b.id)} className="p-2 text-edu-danger hover:bg-edu-dangerLight rounded-lg"><Trash size={16} /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-edu-fg mb-4">{editingId ? 'Sửa bản tin' : 'Tạo bản tin mới'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-edu-fg mb-1">Tiêu đề</label>
                <input {...register('title', { required: true })} className="w-full px-3 py-2 border border-edu-border rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-edu-fg mb-1">Nội dung</label>
                <textarea {...register('message', { required: true })} rows={3} className="w-full px-3 py-2 border border-edu-border rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-edu-fg mb-1">Loại thông báo</label>
                    <select {...register('type')} className="w-full px-3 py-2 border border-edu-border rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-primary">
                    <option value="info">Info (Xanh dương)</option>
                    <option value="success">Success (Xanh lá)</option>
                    <option value="warn">Warning (Vàng)</option>
                    <option value="danger">Danger (Đỏ)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-edu-fg mb-1">Action Link (Tùy chọn)</label>
                    <input {...register('actionLink')} placeholder="/super-admin/..." className="w-full px-3 py-2 border border-edu-border rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-edu-fg mb-1">Role nhận (Bỏ trống = Gửi tất cả)</label>
                    <input {...register('targetRoles')} placeholder="CENTER_ADMIN, TEACHER" className="w-full px-3 py-2 border border-edu-border rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-primary" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-edu-fg mb-1">Tỷ lệ User nhận (%)</label>
                    <input type="number" {...register('targetPercentage')} min="1" max="100" className="w-full px-3 py-2 border border-edu-border rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-primary" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-edu-border">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 text-edu-fg font-medium rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-edu-primary text-white font-medium rounded-xl hover:bg-edu-primary/90 disabled:opacity-50">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
