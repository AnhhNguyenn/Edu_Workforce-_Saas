'use client';

import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Eye } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'audit',
        pageSize: '20',
        pageNumber: page.toString()
      });
      if (keyword) params.append('keyword', keyword);
      if (actionFilter) params.append('action', actionFilter);
      if (startDate) params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) params.append('endDate', format(endDate, 'yyyy-MM-dd'));

      const res = await apiClient.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

  const fieldNames: Record<string, string> = {
    Amount: "Số tiền",
    MonthsToAdd: "Thời hạn (Tháng)",
    PlanName: "Gói dịch vụ",
    PaymentMethod: "Phương thức TT",
    PaymentDate: "Ngày thanh toán",
    ReferenceCode: "Mã tham chiếu",
    FullName: "Họ và tên",
    PhoneNumber: "Số điện thoại",
    Phone: "Số điện thoại",
    Email: "Email",
    Role: "Vai trò",
    Name: "Tên",
    Description: "Mô tả",
    IsActive: "Trạng thái",
    Price: "Giá",
    Address: "Địa chỉ",
    DateOfBirth: "Ngày sinh",
    Gender: "Giới tính",
    AvatarUrl: "Ảnh đại diện",
    Code: "Mã",
    StartTime: "Giờ bắt đầu",
    EndTime: "Giờ kết thúc",
    SessionDate: "Ngày học",
    TeacherId: "Giáo viên",
    AssistantId: "Trợ giảng",
    RoomName: "Phòng học",
    LessonTitle: "Chủ đề bài học",
    Notes: "Ghi chú",
    ActualStudentCount: "Sĩ số thực tế",
    LessonProgress: "Tiến độ bài giảng",
    LocalTeachingAssistant: "Trợ giảng nội bộ",
    ClassId: "Lớp học",
    SchoolId: "Cơ sở",
    GroupId: "Nhóm lớp",
    ClassScheduleId: "Lịch định kỳ",
    ExtraData: "Dữ liệu mở rộng",
    StatusId: "Trạng thái",
    OrganizationId: "Trung tâm",
    CreatedBy: "Người tạo",
    CreatedAt: "Ngày tạo",
    UpdatedBy: "Người cập nhật",
    UpdatedAt: "Ngày cập nhật"
  };

  const getFieldText = (key: string) => {
    if (fieldNames[key]) return fieldNames[key];
    // fallback: capitalize first letter, add spaces before uppercase letters
    const spaced = key.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const ignoredFields = [
    'Id', 'OrganizationId', 'CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt', 'DeletedBy', 'DeletedAt',
    'Version', 'PlanId', 'PromotionId', 'SePayTransactionId', 
    'UserId', 'NormalizedEmail', 'NormalizedUserName', 'SecurityStamp', 'ConcurrencyStamp', 'PasswordHash'
  ];

  const parseJson = (str: string) => {
    if (!str) return {};
    try {
      return JSON.parse(str) || {};
    } catch {
      return {};
    }
  };

  const getChangedFields = (oldStr: string, newStr: string) => {
    const oldObj = parseJson(oldStr);
    const newObj = parseJson(newStr);
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
      .filter(key => !ignoredFields.includes(key));
    const changed = allKeys.filter(key => oldObj[key] !== newObj[key]);
    if (changed.length === 0) return 'Dữ liệu hệ thống';
    return changed.map(k => getFieldText(k)).join(', ');
  };

  const renderDiffTable = (oldStr: string, newStr: string) => {
    const oldObj = parseJson(oldStr);
    const newObj = parseJson(newStr);
    
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
      .filter(key => !ignoredFields.includes(key));

    const diffKeys = allKeys.filter(key => oldObj[key] !== newObj[key]);

    const changedKeys = allKeys.filter(key => oldObj[key] !== newObj[key]);

    if (changedKeys.length === 0) {
      return <div className="text-gray-500 italic p-6 text-center bg-gray-50 rounded-xl border border-gray-100">Không có thay đổi dữ liệu nào đáng kể được ghi nhận.</div>;
    }

    return (
      <div className="w-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm mt-4">
        <div className="overflow-x-auto w-full border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Thuộc tính</th>
                <th className="px-4 py-3 font-semibold text-red-600">Trước khi thay đổi</th>
                <th className="px-4 py-3 font-semibold text-green-600">Sau khi thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {changedKeys.map(key => {
                const oldVal = oldObj[key];
                const newVal = newObj[key];
                const displayKey = getFieldText(key);
                
                const formatVal = (val: any) => {
                  if (val === null || val === undefined) return <span className="text-gray-400 italic">Trống</span>;
                  if (typeof val === 'boolean') {
                    return val ? <span className="text-green-600 font-medium">Có</span> : <span className="text-red-500 font-medium">Không</span>;
                  }
                  if (typeof val === 'string' && val.includes('T') && val.endsWith('Z')) {
                    try { return format(new Date(val), "dd/MM/yyyy HH:mm"); } catch { return val; }
                  }
                  return String(val);
                };

                return (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">{displayKey}</td>
                    <td className="px-4 py-3 text-red-600 bg-red-50/50">
                       <div className="line-through opacity-80 break-words whitespace-pre-wrap">{formatVal(oldVal)}</div>
                    </td>
                    <td className="px-4 py-3 text-green-700 bg-green-50/50 font-medium">
                       <div className="break-words whitespace-pre-wrap">{formatVal(newVal)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'added': 
      case 'insert':
      case 'create': return 'success';
      case 'modified': 
      case 'update': return 'info';
      case 'deleted': 
      case 'delete': return 'danger';
      default: return 'muted';
    }
  };

  const getActionText = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'added': 
      case 'insert':
      case 'create': return 'Thêm mới';
      case 'modified': 
      case 'update': return 'Cập nhật';
      case 'deleted': 
      case 'delete': return 'Xóa';
      default: return action;
    }
  };

  const getEntityText = (entityType: string) => {
    // Không trả về ánh xạ trực tiếp để bảo mật cấu trúc Database
    return 'Dữ liệu hệ thống';
  };

  return (
    <div className="w-full space-y-7">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Nhật ký Hoạt động (Audit Logs)</h2>
        <p className="text-edu-muted text-sm">Theo dõi mọi thay đổi dữ liệu trong trung tâm của bạn</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-edu-border shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Tìm kiếm (Tên, Email)</label>
          <Input 
            type="text" 
            placeholder="Nhập từ khóa..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>
        <div className="w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Hành động</label>
          <Select 
            options={[
              { value: "", label: "Tất cả" },
              { value: "create", label: "Thêm mới" },
              { value: "update", label: "Cập nhật" },
              { value: "delete", label: "Xóa" }
            ]}
            value={actionFilter}
            onChange={(value) => setActionFilter(value)}
          />
        </div>
        <div className="w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
          <DatePicker 
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="dd/mm/yyyy"
          />
        </div>
        <div className="w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
          <DatePicker 
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="dd/mm/yyyy"
          />
        </div>
        <Button 
          variant="primary"
          onClick={handleFilter}
        >
          Lọc dữ liệu
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-edu-muted">
          <Loader2 className="animate-spin mr-2" size={24} /> Đang tải dữ liệu...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-edu-muted">
          Không có nhật ký hoạt động nào.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-edu-fg">{log.userName}</div>
                    <div className="text-xs text-edu-muted">{log.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {getActionText(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-edu-fg max-w-[200px] truncate" title={getChangedFields(log.oldData, log.newData)}>
                      {getChangedFields(log.oldData, log.newData)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(log.oldData || log.newData) && (
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-edu-accent hover:text-edu-accentDark flex items-center gap-1 font-medium transition-colors"
                      >
                        <Eye size={16} /> Xem
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              <span className="text-sm font-medium text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)}
        title="Chi tiết thay đổi"
        className="max-w-4xl"
      >
        <p className="text-sm text-edu-muted mb-2">
          Hệ thống đang hiển thị so sánh dữ liệu bị thay đổi của <span className="font-semibold text-edu-fg bg-gray-100 px-2 py-0.5 rounded">{selectedLog ? getEntityText(selectedLog.entityType) : ''}</span>
        </p>
        
        {renderDiffTable(selectedLog?.oldData, selectedLog?.newData)}
      </Modal>
    </div>
  );
}
