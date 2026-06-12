'use client';

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from "@/components/ui/create-button";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { getAvatarInitials } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization, useToggleOrgStatus, useOrganizationStats, useUpdateOrgSubscription } from "@/hooks/queries/useOrganizations";
import { usePlans } from "@/hooks/queries/useSubscriptions";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useConfirm } from "@/providers/ConfirmProvider";

export default function OrganizationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const { confirm } = useConfirm();
  const [formData, setFormData] = useState({ name: '', email: '', address: '', planId: '' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', address: '' });
  const [errors, setErrors] = useState<{name?: string, email?: string, address?: string, planId?: string}>({});
  const [subscriptionFormData, setSubscriptionFormData] = useState({ planId: '', subscriptionStatus: 'TRIAL', subscriptionEnd: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // React Query Hook
  const { data: orgs, isLoading, isError } = useOrganizations(debouncedSearch);
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();
  const toggleStatusMutation = useToggleOrgStatus();
  const updateSubscriptionMutation = useUpdateOrgSubscription();
  const { data: plansData } = usePlans();

  const handleCreate = async () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập Tên trung tâm";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập Email liên hệ";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập Thành phố";
    if (!formData.planId) newErrors.planId = "Vui lòng chọn Gói cước";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.name.toUpperCase().replace(/\s+/g, '_').substring(0, 10) + '_' + Math.floor(Math.random() * 1000),
        email: formData.email,
        address: formData.address,
        planId: formData.planId,
        maxUsers: 50 // Default
      });
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', address: '', planId: '' });
      setErrors({});
      toast.success("Tạo trung tâm thành công!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Tạo trung tâm thất bại.");
    }
  };

  const handleEdit = async () => {
    if (!selectedOrg) return;
    if (!editFormData.name.trim()) return toast.error("Vui lòng nhập Tên trung tâm");
    if (!editFormData.email.trim()) return toast.error("Vui lòng nhập Email Admin");
    if (!editFormData.address.trim()) return toast.error("Vui lòng nhập Thành phố");

    try {
      await updateMutation.mutateAsync({
        id: selectedOrg.id,
        data: editFormData
      });
      setIsEditOpen(false);
      toast.success("Cập nhật trung tâm thành công!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Cập nhật trung tâm thất bại.");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedOrg) return;
    const action = selectedOrg.statusCode === 'ACTIVE' ? 'suspend' : 'activate';
    try {
      await toggleStatusMutation.mutateAsync({ id: selectedOrg.id, action });
      setSelectedOrg({ ...selectedOrg, statusCode: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' });
      toast.success("Thay đổi trạng thái thành công!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Thay đổi trạng thái thất bại.");
    }
  };

  const handleChangePlan = async () => {
    if (!selectedOrg) return;
    try {
      await updateSubscriptionMutation.mutateAsync({
        id: selectedOrg.id,
        data: {
          planId: subscriptionFormData.planId || null,
          subscriptionStatus: subscriptionFormData.subscriptionStatus,
          subscriptionEnd: subscriptionFormData.subscriptionEnd ? new Date(subscriptionFormData.subscriptionEnd).toISOString() : null
        }
      });
      setIsChangePlanOpen(false);
      setSelectedOrg(null); // Close detail modal to refresh
      toast.success("Đổi gói thành công!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Đổi gói thất bại.");
    }
  };

  const handleDeleteClick = (org: any) => {
    confirm({
      title: "Xác nhận xóa Trung tâm",
      description: `Bạn có chắc chắn muốn xóa trung tâm "${org.name}" không? Hành động này không thể hoàn tác.`,
      requireInput: true,
      expectedInput: "XAC NHAN",
      action: async () => {
        try {
          await deleteMutation.mutateAsync(org.id);
          toast.success("Đã xóa trung tâm.");
        } catch (e: any) {
          toast.error(e.response?.data?.message || "Xóa trung tâm thất bại.");
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Tổ chức & Trung tâm</h2>
          <p className="text-edu-muted text-sm">Quản lý toàn bộ các trung tâm sử dụng hệ thống EduOps</p>
        </div>
        <CreateButton onClick={() => setIsCreateOpen(true)} label="Tạo trung tâm mới" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4 bg-gray-50/50">
          <h3 className="text-base font-semibold text-edu-fg flex items-center gap-2">
            Danh sách Tổ chức
            <Badge variant="info">{orgs?.totalCount || 0}</Badge>
          </h3>
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input 
                placeholder="Tìm mã trung tâm, tên..." 
                className="pl-9 h-9 text-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-10 text-center text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu trung tâm...</div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Trung tâm</TableHead>
              <TableHead>Thành phố</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState 
                    hasFilter={!!searchTerm}
                    onClearFilter={() => setSearchTerm('')}
                    description="Không tìm thấy trung tâm nào."
                  />
                </TableCell>
              </TableRow>
            ) : orgs?.items?.map((org: any, idx: number) => (
              <TableRow key={idx} onClick={() => setSelectedOrg(org)} className="cursor-pointer">
                <TableCell className="font-medium text-edu-fg truncate max-w-[200px]" title={org.name}>{org.name ?? 'Chưa cập nhật'}</TableCell>
                <TableCell className="truncate max-w-[150px]" title={org.city}>{org.city ?? 'Chưa cập nhật'}</TableCell>
                <TableCell>
                  <Badge variant={org.statusCode === 'ACTIVE' ? 'success' : 'danger'}>
                    {org.statusCode === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </TableCell>
                <TableCell>
                   <ActionButtons
                     onEdit={() => {
                       setSelectedOrg(org); 
                       setEditFormData({ name: org.name || '', email: org.email || '', address: org.address || '' }); 
                       setIsEditOpen(true); 
                     }}
                     onDelete={() => handleDeleteClick(org)}
                   />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => { setIsCreateOpen(false); setErrors({}); }} 
        title="Tạo trung tâm mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>Hủy</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {createMutation.isPending ? "Đang lưu..." : "Lưu trung tâm"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Tên trung tâm</label>
            <Input 
              placeholder="Nhập tên trung tâm..." 
              value={formData.name}
              onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({...errors, name: ''}); }}
              error={errors.name}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email liên hệ</label>
              <Input 
                type="email" 
                placeholder="contact@center.com" 
                value={formData.email}
                onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({...errors, email: ''}); }}
                error={errors.email}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Thành phố</label>
              <Input 
                placeholder="Ví dụ: TP.HCM" 
                value={formData.address}
                onChange={e => { setFormData({ ...formData, address: e.target.value }); setErrors({...errors, address: ''}); }}
                error={errors.address}
              />
            </div>
            <div className="col-span-2 mt-1">
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Gói cước khởi tạo *</label>
              <Select 
                placeholder="Chọn gói cước..."
                value={formData.planId}
                onChange={val => { setFormData({ ...formData, planId: val }); setErrors({...errors, planId: ''}); }}
                options={plansData?.map((p: any) => ({ value: p.id, label: p.name })) || []}
              />
              {errors.planId && <p className="mt-1 text-xs text-edu-danger">{errors.planId}</p>}
            </div>
          </div>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal 
        isOpen={!!selectedOrg && !isEditOpen} 
        onClose={() => setSelectedOrg(null)} 
        title={`Chi tiết: ${selectedOrg?.name || 'Trung tâm'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedOrg(null)}>Đóng</Button>
            <Button 
              variant={selectedOrg?.statusCode === 'ACTIVE' ? "danger" : "primary"}
              onClick={handleToggleStatus}
              disabled={toggleStatusMutation.isPending}
              className="gap-2"
            >
              {toggleStatusMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {toggleStatusMutation.isPending ? 'Đang xử lý...' : (selectedOrg?.statusCode === 'ACTIVE' ? 'Khóa trung tâm' : 'Mở khóa trung tâm')}
            </Button>
          </>
        }
      >
        <OrgDetailStats 
          selectedOrg={selectedOrg} 
          setSubscriptionFormData={setSubscriptionFormData} 
          setIsChangePlanOpen={setIsChangePlanOpen} 
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Sửa trung tâm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)} disabled={updateMutation.isPending}>Hủy</Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending} className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Tên trung tâm</label>
            <Input 
              placeholder="Nhập tên trung tâm..." 
              value={editFormData.name}
              onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email Admin</label>
              <Input 
                type="email" 
                placeholder="admin@center.com" 
                value={editFormData.email}
                onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Thành phố</label>
              <Input 
                placeholder="Ví dụ: TP.HCM" 
                value={editFormData.address}
                onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* CHANGE PLAN MODAL */}
      <Modal 
        isOpen={isChangePlanOpen} 
        onClose={() => setIsChangePlanOpen(false)} 
        title={`Đổi gói cho: ${selectedOrg?.name || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsChangePlanOpen(false)} disabled={updateSubscriptionMutation.isPending}>Hủy</Button>
            <Button onClick={handleChangePlan} disabled={updateSubscriptionMutation.isPending} className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              {updateSubscriptionMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {updateSubscriptionMutation.isPending ? "Đang lưu..." : "Xác nhận đổi gói"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Gói cước (Plan)</label>
            <Select 
              value={subscriptionFormData.planId}
              onChange={v => setSubscriptionFormData({ ...subscriptionFormData, planId: v })}
              options={[
                { value: '', label: '-- Không gán gói / Mặc định --' },
                ...(plansData?.map((plan: any) => ({
                  value: plan.id,
                  label: `${plan.name} - ${plan.pricePerMonth?.toLocaleString('vi-VN')}đ/tháng`
                })) || [])
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trạng thái gói</label>
            <Select 
              value={subscriptionFormData.subscriptionStatus}
              onChange={v => setSubscriptionFormData({ ...subscriptionFormData, subscriptionStatus: v })}
              options={[
                { value: 'TRIAL', label: 'Dùng thử (TRIAL)' },
                { value: 'PAID', label: 'Đã thanh toán (PAID)' },
                { value: 'UNPAID', label: 'Chưa thanh toán / Miễn phí (UNPAID)' },
                { value: 'EXPIRED', label: 'Đã hết hạn (EXPIRED)' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Ngày hết hạn (Tuỳ ý ấn định)</label>
            <DatePicker 
              selected={subscriptionFormData.subscriptionEnd ? new Date(subscriptionFormData.subscriptionEnd) : null}
              onChange={(date) => setSubscriptionFormData({ ...subscriptionFormData, subscriptionEnd: date ? date.toISOString().split('T')[0] : '' })}
              placeholderText="Chọn ngày hết hạn..."
            />
            <div className="flex gap-2 mt-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  const baseDate = subscriptionFormData.subscriptionEnd ? new Date(subscriptionFormData.subscriptionEnd) : new Date();
                  const newDate = new Date(baseDate.setMonth(baseDate.getMonth() + 1));
                  setSubscriptionFormData({...subscriptionFormData, subscriptionEnd: newDate.toISOString().split('T')[0]});
                }}
              >+1 Tháng</Button>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  const baseDate = subscriptionFormData.subscriptionEnd ? new Date(subscriptionFormData.subscriptionEnd) : new Date();
                  const newDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));
                  setSubscriptionFormData({...subscriptionFormData, subscriptionEnd: newDate.toISOString().split('T')[0]});
                }}
              >+1 Năm</Button>
            </div>
            <p className="text-xs text-edu-muted mt-2">Để trống nếu muốn sử dụng vĩnh viễn (như gói UNPAID).</p>
          </div>
        </div>
      </Modal>

    </div>
  );
}

function OrgDetailStats({ 
  selectedOrg, 
  setSubscriptionFormData, 
  setIsChangePlanOpen 
}: { 
  selectedOrg: any, 
  setSubscriptionFormData: any, 
  setIsChangePlanOpen: any 
}) {
  const { data: stats, isLoading } = useOrganizationStats(selectedOrg?.id);

  if (!selectedOrg) return null;
  if (isLoading) return <div className="py-10 text-center text-edu-muted">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-4">
       <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-edu-accentLight rounded-lg">
          <div className="text-xl font-bold">{stats?.teachers || 0}</div>
          <div className="text-xs text-edu-muted mt-1">Giáo viên</div>
        </div>
        <div className="text-center p-3 bg-edu-successLight rounded-lg">
          <div className="text-xl font-bold">{stats?.sessionsPerMonth || 0}</div>
          <div className="text-xs text-edu-muted mt-1">Sessions/tháng</div>
        </div>
        <div className="text-center p-3 bg-edu-warnLight rounded-lg">
          <div className="text-xl font-bold">{stats?.attendanceRate || 0}%</div>
          <div className="text-xs text-edu-muted mt-1">Attendance</div>
        </div>
      </div>
            
            <div className="flex items-center justify-between py-2 border-b border-edu-border">
              <span className="text-sm text-edu-fgSecondary">Gói (Plan)</span>
              <div className="flex items-center gap-2">
                <Badge variant="info">{selectedOrg.subscriptionStatus || 'TRIAL'}</Badge>
                <Button variant="secondary" size="sm" onClick={() => {
                  setSubscriptionFormData({
                     planId: selectedOrg.currentPlanId || '', 
                     subscriptionStatus: selectedOrg.subscriptionStatus || 'TRIAL',
                     subscriptionEnd: selectedOrg.subscriptionEnd ? new Date(selectedOrg.subscriptionEnd).toISOString().split('T')[0] : ''
                  });
                  setIsChangePlanOpen(true);
                }}>Đổi gói</Button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-edu-border">
              <span className="text-sm text-edu-fgSecondary">Ngày hết hạn</span>
              <span className="text-sm font-medium">
                {selectedOrg.subscriptionEnd ? new Date(selectedOrg.subscriptionEnd).toLocaleDateString('vi-VN') : 'Không có thời hạn'}
              </span>
            </div>
          </div>
  );
}
