import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButtons } from '@/components/ui/action-buttons';
import { EmptyState } from '@/components/ui/EmptyState';

interface StudentTableProps {
  students: any[];
  isLoading: boolean;
  onEdit: (student: any) => void;
  onDelete: (studentId: string) => void;
  isAuthorized: boolean;
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (studentId: string, checked: boolean) => void;
}

export function StudentTable({ students, isLoading, onEdit, onDelete, isAuthorized, selectedIds = [], onSelectAll, onSelectRow }: StudentTableProps) {
  const allSelected = students.length > 0 && selectedIds.length === students.length;

  return (
    <div className="bg-white rounded-2xl border border-edu-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto w-full">
        <Table className="w-full whitespace-nowrap">
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-12 text-center">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-edu-accent rounded border-gray-300 focus:ring-edu-accent cursor-pointer"
                checked={allSelected}
                onChange={(e) => onSelectAll?.(e.target.checked)}
              />
            </TableHead>
            <TableHead className="w-[100px] font-semibold">Mã HV</TableHead>
            <TableHead className="font-semibold">Họ tên</TableHead>
            <TableHead className="font-semibold">Liên hệ</TableHead>
            <TableHead className="font-semibold">Lớp học</TableHead>
            <TableHead className="font-semibold">Học phí</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="w-[100px] text-right font-semibold">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-edu-muted"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <EmptyState description="Không tìm thấy học viên nào." />
              </TableCell>
            </TableRow>
          ) : students.map((std: any, i: number) => {
            const isSelected = selectedIds.includes(std.id);
            return (
              <TableRow key={std.id || i} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-edu-accentLighter/30' : ''}`}>
                <TableCell className="text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-edu-accent rounded border-gray-300 focus:ring-edu-accent cursor-pointer"
                    checked={isSelected}
                    onChange={(e) => onSelectRow?.(std.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell className="font-medium text-edu-fg">{std.studentCode ?? 'Chưa cấp'}</TableCell>
                <TableCell>
                  <div className="font-semibold text-edu-fgSecondary truncate max-w-[150px]" title={std.fullName}>{std.fullName ?? 'Chưa cập nhật'}</div>
                  <div className="text-xs text-edu-muted">
                    {std.dateOfBirth ? new Date(std.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm truncate max-w-[120px]">{std.phoneNumber ?? 'Trống'}</div>
                  <div className="text-xs text-edu-muted truncate max-w-[120px]">{std.email ?? 'Trống'}</div>
                </TableCell>
                <TableCell className="text-edu-fgSecondary font-medium">{std.currentClass || 'Chưa xếp lớp'}</TableCell>
                <TableCell>
                  <div className="font-semibold text-edu-accent">{std.feeStatus}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={std.statusCode === 'ACTIVE' ? 'success' : 'warn'}>
                    {std.statusCode === 'ACTIVE' ? 'Đang học' : 'Bảo lưu'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <ActionButtons
                      onEdit={() => onEdit(std)}
                      onDelete={isAuthorized ? () => onDelete(std.id) : undefined}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
