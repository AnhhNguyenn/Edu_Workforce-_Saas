'use client';

import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAvatarInitials } from "@/lib/utils";
import { useOrganizations, useCreateOrganization, useOrganizationStats } from "@/hooks/queries/useOrganizations";

export default function OrganizationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  
  // React Query Hook
  const { data: orgs, isLoading, isError } = useOrganizations();
  const createMutation = useCreateOrganization();

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
      alert("Tạo trung tâm thành công!");
    } catch (e) {
      alert("Tạo trung tâm thất bại. Kiểm tra log.");
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
              <Input placeholder="Tìm mã trung tâm, tên..." className="pl-9 h-9 text-sm" />
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
                <TableCell><Badge variant="success">Active</Badge></TableCell>
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
        isOpen={!!selectedOrg} 
        onClose={() => setSelectedOrg(null)} 
        title={`Chi tiết: ${selectedOrg?.name || 'Trung tâm'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedOrg(null)}>Đóng</Button>
            <Button variant="danger">Khóa trung tâm</Button>
          </>
        }
      >
        <OrgDetailStats selectedOrg={selectedOrg} />
      </Modal>
    </div>
  );
}

function OrgDetailStats({ selectedOrg }: { selectedOrg: any }) {
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
                <Badge variant="info">{selectedOrg.plan || 'Basic'}</Badge>
                <Button variant="secondary" size="sm">Đổi gói</Button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-edu-border">
              <span className="text-sm text-edu-fgSecondary">Ngày hết hạn</span>
              <span className="text-sm font-medium">{selectedOrg.expires || 'N/A'}</span>
            </div>
          </div>
  );
}
