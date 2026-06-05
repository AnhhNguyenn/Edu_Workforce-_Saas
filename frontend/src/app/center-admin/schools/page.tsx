'use client';

import { useState } from 'react';
import { Plus, School as SchoolIcon, MapPin, Users, Target, X, Loader2 } from "lucide-react";
import { useSchools, useCreateSchool } from "@/hooks/queries/useSchools";
import LocationPicker from '@/components/ui/LocationPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
  '#E91E63', '#00BCD4', '#FFC107', '#607D8B',
];

export default function SchoolsPage() {
  const { data: schools, isLoading } = useSchools();
  const createMutation = useCreateSchool();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    attendanceRadius: 200,
    latitude: 21.028511, // Default to Hanoi
    longitude: 105.804817
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Vui lòng nhập tên cơ sở");
    
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Tạo cơ sở thành công!");
        setIsModalOpen(false);
        setFormData({ name: '', address: '', attendanceRadius: 200, latitude: 21.028511, longitude: 105.804817 });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Lỗi tạo cơ sở");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Cơ sở / Trường học</h2>
          <p className="text-edu-muted text-sm">Quản lý điểm dạy và tọa độ GPS Check-in</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-edu-accent text-white rounded-lg font-medium hover:bg-edu-accentHover transition-colors shadow-sm"
        >
          <Plus size={18} />
          Thêm cơ sở
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schools?.items?.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-edu-border hover:border-edu-accent hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: COLORS[i % 8] }}>
                  <SchoolIcon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-edu-fg text-base leading-tight">{s.name}</h4>
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

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-edu-border">
              <h3 className="text-xl font-bold text-edu-fg">Thêm Cơ Sở Mới</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-edu-muted hover:bg-gray-100 rounded-full h-8 w-8"><X size={20} /></Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-edu-fg mb-1">Tên cơ sở *</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Cơ sở Cầu Giấy..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-edu-fg mb-1">Địa chỉ</label>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Số nhà, đường..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-edu-fg mb-1">Bán kính điểm danh (m)</label>
                  <Input type="number" value={formData.attendanceRadius} onChange={e => setFormData({...formData, attendanceRadius: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-edu-fg mb-1 flex items-center gap-2">
                  <MapPin size={16} className="text-edu-accent" /> 
                  Ghim Tọa Độ Bản Đồ (Bắt buộc cho Check-in)
                </label>
                <LocationPicker 
                  lat={formData.latitude} 
                  lng={formData.longitude} 
                  onChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button disabled={createMutation.isPending} type="submit" className="bg-edu-accent text-white gap-2">
                  {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Lưu cơ sở
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
