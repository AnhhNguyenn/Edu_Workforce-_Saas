'use client';

import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAvatarInitials } from "@/lib/utils";
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization, useToggleOrgStatus, useOrganizationStats, useUpdateOrgSubscription } from "@/hooks/queries/useOrganizations";
import { usePlans } from "@/hooks/queries/useSubscriptions";
import { useEffect } from "react";

export default function OrganizationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', address: '' });
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
    if (!formData.name || !formData.email) return alert("Vui lòng nhập tên và email");
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.name.toUpperCase().replace(/\s+/g, '_').substring(0, 10) + '_' + Math.floor(Math.random() * 1000),
        email: formData.email,
        address: formData.address,
        maxUsers: 50 // Default
      });
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', address: '' });
      // alert("Tạo trung tâm thành công!"); // using hot toast later if we implement it globally
    } catch (e) {
      alert("Tạo trung tâm thất bại. Kiểm tra log.");
    }
  };

  const handleEdit = async () => {
    if (!selectedOrg) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedOrg.id,
        data: editFormData
      });
      setIsEditOpen(false);
    } catch (e) {
      alert("Cập nhật trung tâm thất bại.");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedOrg) return;
    const action = selectedOrg.statusCode === 'ACTIVE' ? 'suspend' : 'activate';
    try {
      await toggleStatusMutation.mutateAsync({ id: selectedOrg.id, action });
      setSelectedOrg({ ...selectedOrg, statusCode: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' });
    } catch (e) {
      alert("Thay đổi trạng thái thất bại.");
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
    } catch (e) {
      alert("Đổi gói thất bại.");
    }
  };

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa trung tâm "${orgName}" không? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteMutation.mutateAsync(orgId);
    } catch (e) {
      alert("Xóa trung tâm thất bại.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Tổ chức & Trung tâm</h2>
          <p className="text-edu-muted text-sm">Quản lý toàn bộ các trung tâm sử dụng hệ thống EduOps</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          Tạo trung tâm mới
        </Button>
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
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Trung tâm</TableHead>
              <TableHead>Thành phố</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs?.items?.map((org: any, idx: number) => (
              <TableRow key={idx} onClick={() => setSelectedOrg(org)} className="cursor-pointer">
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.city}</TableCell>
                <TableCell>
                  <Badge variant={org.statusCode === 'ACTIVE' ? 'success' : 'danger'}>
                    {org.statusCode === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                     <Button 
                       variant="secondary" 
                       size="sm" 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         setSelectedOrg(org); 
                         setEditFormData({ name: org.name || '', email: org.email || '', address: org.address || '' }); 
                         setIsEditOpen(true); 
                       }}
                     >
                       Sửa
                     </Button>
                     <Button 
                       variant="danger" 
                       size="sm" 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         handleDelete(org.id, org.name); 
                       }}
                       disabled={deleteMutation.isPending}
                     >
                       Xóa
                     </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* CREATE MODAL */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Tạo trung tâm mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>Hủy</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
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
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Email Admin</label>
              <Input 
                type="email" 
                placeholder="admin@center.com" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Thành phố</label>
              <Input 
                placeholder="Ví dụ: TP.HCM" 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
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
            >
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
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
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
            <Button onClick={handleChangePlan} disabled={updateSubscriptionMutation.isPending}>
              {updateSubscriptionMutation.isPending ? "Đang lưu..." : "Xác nhận đổi gói"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Gói cước (Plan)</label>
            <select 
              className="flex h-10 w-full rounded-md border border-edu-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-accent focus-visible:ring-offset-2"
              value={subscriptionFormData.planId}
              onChange={e => setSubscriptionFormData({ ...subscriptionFormData, planId: e.target.value })}
            >
              <option value="">-- Không gán gói / Mặc định --</option>
              {plansData?.map((plan: any) => (
                <option key={plan.id} value={plan.id}>{plan.name} - {plan.pricePerMonth?.toLocaleString('vi-VN')}đ/tháng</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Trạng thái gói</label>
            <select 
              className="flex h-10 w-full rounded-md border border-edu-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-accent focus-visible:ring-offset-2"
              value={subscriptionFormData.subscriptionStatus}
              onChange={e => setSubscriptionFormData({ ...subscriptionFormData, subscriptionStatus: e.target.value })}
            >
              <option value="TRIAL">Dùng thử (TRIAL)</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="UNPAID">Chưa thanh toán / Miễn phí (UNPAID)</option>
              <option value="EXPIRED">Đã hết hạn (EXPIRED)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-edu-fgSecondary mb-1.5">Ngày hết hạn (Tuỳ ý ấn định)</label>
            <Input 
              type="date"
              value={subscriptionFormData.subscriptionEnd}
              onChange={e => setSubscriptionFormData({ ...subscriptionFormData, subscriptionEnd: e.target.value })}
            />
            <p className="text-xs text-edu-muted mt-1">Để trống nếu muốn sử dụng vĩnh viễn (như gói UNPAID).</p>
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
                     planId: '', // Default or find current plan
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
