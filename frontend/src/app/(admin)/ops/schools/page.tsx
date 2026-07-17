'use client';

import { useState } from 'react';
import { School as SchoolIcon, MapPin, Users, Target, X, Loader2, Search, Filter, Building } from "lucide-react";
import { useSchools, useCreateSchool, useUpdateSchool, useDeleteSchool } from "@/hooks/queries/useSchools";
import LocationPicker from '@/components/ui/LocationPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/ui/create-button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Select } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useProfile } from '@/hooks/queries/useProfile';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm } from '@/providers/ConfirmProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Portal } from '@/components/ui/portal';

const schoolSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên cơ sở'),
  address: z.string().optional(),
  attendanceRadius: z.number({ message: "Vui lòng nhập số hợp lệ" }).min(10, 'Bán kính tối thiểu 10m'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
  '#E91E63', '#00BCD4', '#FFC107', '#607D8B',
];

export default function SchoolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [gpsFilter, setGpsFilter] = useState<string>('ALL');

  const { data: schools, isLoading } = useSchools(debouncedSearch);
  const { data: profile } = useProfile();
  
  const createMutation = useCreateSchool();
  const updateMutation = useUpdateSchool();
  const deleteMutation = useDeleteSchool();

  const isAuthorized = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CENTER_ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const { confirm } = useConfirm();

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      address: '',
      attendanceRadius: 200,
      latitude: 21.028511,
      longitude: 105.804817
    }
  });

  const attendanceRadius = watch('attendanceRadius') || 200;

  const filteredSchools = schools?.items?.filter(s => {
    if (gpsFilter === 'HAS_GPS') return s.latitude && s.longitude;
    if (gpsFilter === 'NO_GPS') return !s.latitude || !s.longitude;
    return true;
  });

  const openCreateModal = () => {
    setEditingSchoolId(null);
    reset({ name: '', address: '', attendanceRadius: 200, latitude: 21.028511, longitude: 105.804817 });
    setIsModalOpen(true);
  };

  const openEditModal = (school: any) => {
    setEditingSchoolId(school.id);
    reset({
      name: school.name || '',
      address: school.address || '',
      attendanceRadius: school.gpsRadius || 200,
      latitude: school.latitude || 21.028511,
      longitude: school.longitude || 105.804817
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (schoolId: string) => {
    confirm({
      title: "Xóa cơ sở (Trường học)",
      description: "Bạn đang chuẩn bị xóa một cơ sở. Nếu cơ sở này đang có lớp học hoặc nhân sự, hệ thống có thể từ chối xóa.",
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(schoolId);
          toast.success("Đã xóa cơ sở!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Lỗi xóa cơ sở");
        }
      }
    });
  };

  const onSubmit = (data: SchoolFormValues) => {
    if (editingSchoolId) {
      updateMutation.mutate({ id: editingSchoolId, data }, {
        onSuccess: () => {
          toast.success("Cập nhật cơ sở thành công!");
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Lỗi cập nhật cơ sở");
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Tạo cơ sở thành công!");
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Lỗi tạo cơ sở");
        }
      });
    }
  };

  return (
    <div className="w-full h-full space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Cơ sở / Trường học</h2>
          <p className="text-edu-muted text-sm">Quản lý điểm dạy và tọa độ GPS Check-in</p>
        </div>
        {isAuthorized && (
          <div className="w-full sm:w-auto">
            <CreateButton onClick={openCreateModal} label="Thêm cơ sở" className="w-full sm:w-auto" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-4 md:p-5 mb-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
          Danh sách Cơ sở
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 flex-1 md:max-w-md w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
            <Input 
              placeholder="Tìm tên cơ sở..." 
              className="pl-9 h-10 sm:h-9 text-sm focus:border-edu-accent focus:ring-edu-accent/30 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[160px]">
            <Select 
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'HAS_GPS', label: 'Đã ghim GPS' },
                { value: 'NO_GPS', label: 'Chưa có GPS' }
              ]}
              value={gpsFilter}
              onChange={(val) => setGpsFilter(val)}
              className="h-10 sm:h-9 focus:border-edu-accent focus:ring-edu-accent/30 w-full"
              placeholder="Lọc GPS"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</div>
      ) : filteredSchools?.length === 0 ? (
        <EmptyState 
          icon={<Building size={32} />}
          title="Chưa có cơ sở nào"
          hasFilter={!!searchTerm || gpsFilter !== 'ALL'}
          onClearFilter={() => { setSearchTerm(''); setGpsFilter('ALL'); }}
          description="Không tìm thấy cơ sở nào phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchools?.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-edu-border hover:border-edu-accent hover:shadow-md transition-all group relative">
              {isAuthorized && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionButtons
                    onEdit={() => openEditModal(s)}
                    onDelete={() => handleDeleteClick(s.id)}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: COLORS[i % 8] }}>
                  <SchoolIcon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-edu-fg text-base leading-tight pr-14">{s.name}</h4>
                  {s.latitude && s.longitude && (
                    <span className="text-[10px] text-edu-success font-medium flex items-center mt-1">
                      <Target size={10} className="mr-1" /> Có tọa độ GPS
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-edu-muted mb-3 flex items-start gap-1.5 min-h-[40px]">
                <MapPin size={14} className="mt-0.5 text-edu-muted shrink-0" />
                <span className="leading-snug line-clamp-2">{s.address || 'Chưa cập nhật địa chỉ'}</span>
              </div>
              
              <div className="flex gap-4 text-[0.8rem] text-edu-fgSecondary font-medium">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-edu-accent" /> Đang hoạt động
                </div>
                <div className="flex items-center gap-1.5">
                  <Target size={14} className="text-edu-accent" /> {s.gpsRadius || 200}m quét
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-edu-border">
              <h3 className="text-xl font-bold text-edu-fg">{editingSchoolId ? 'Sửa Cơ Sở' : 'Thêm Cơ Sở Mới'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-edu-muted hover:bg-gray-100 rounded-full h-8 w-8"><X size={20} /></Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-edu-fg mb-1">Tên cơ sở *</label>
                  <Input {...register('name')} error={errors.name?.message} placeholder="VD: Cơ sở Cầu Giấy..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-edu-fg mb-1">Địa chỉ</label>
                  <Input {...register('address')} error={errors.address?.message} placeholder="Số nhà, đường..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-edu-fg mb-1">Bán kính điểm danh (m)</label>
                  <Input type="number" {...register('attendanceRadius', { valueAsNumber: true })} error={errors.attendanceRadius?.message} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-edu-fg mb-1 flex items-center gap-2">
                  <MapPin size={16} className="text-edu-accent" /> 
                  Ghim Tọa Độ Bản Đồ (Bắt buộc cho Check-in)
                </label>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field: { value: lat, onChange: setLat } }) => (
                    <Controller
                      name="longitude"
                      control={control}
                      render={({ field: { value: lng, onChange: setLng } }) => (
                        <LocationPicker 
                          lat={lat!} 
                          lng={lng!} 
                          radius={attendanceRadius}
                          onChange={(newLat, newLng) => {
                            setLat(newLat);
                            setLng(newLng);
                          }} 
                          onAddressChange={(address) => {
                            setValue('address', address, { shouldValidate: true, shouldDirty: true });
                          }}
                        />
                      )}
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button disabled={createMutation.isPending || updateMutation.isPending} type="submit" className="bg-edu-accent text-white gap-2">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  Lưu cơ sở
                </Button>
              </div>
            </form>
          </div>
        </div>
        </Portal>
      )}

    </div>
  );
}
