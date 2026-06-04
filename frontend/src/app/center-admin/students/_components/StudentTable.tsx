import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentTableProps {
  students: any[];
  isLoading: boolean;
  onEdit: (student: any) => void;
  onDelete: (studentId: string) => void;
}

export function StudentTable({ students, isLoading, onEdit, onDelete }: StudentTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-edu-border overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
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
              <TableCell colSpan={7} className="text-center py-10 text-edu-muted">Đang tải dữ liệu...</TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-edu-muted">Chưa có học viên nào.</TableCell>
            </TableRow>
          ) : students.map((std: any, i: number) => (
            <TableRow key={i}>
              <TableCell className="font-medium text-edu-fg">{std.code}</TableCell>
              <TableCell>
                <div className="font-semibold text-edu-fgSecondary">{std.fullName}</div>
                <div className="text-xs text-edu-muted">{std.dateOfBirth}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{std.phoneNumber}</div>
                <div className="text-xs text-edu-muted">{std.email}</div>
              </TableCell>
              <TableCell className="text-edu-fgSecondary font-medium">{std.currentClass || 'Chưa xếp lớp'}</TableCell>
              <TableCell>
                <div className="font-semibold text-edu-accent">{std.feeStatus}</div>
              </TableCell>
              <TableCell>
                <Badge variant={std.status === 'active' ? 'success' : 'warn'}>
                  {std.status === 'active' ? 'Đang học' : 'Bảo lưu'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => onEdit(std)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => {
                    if(confirm('Bạn có chắc chắn muốn xóa học viên này?')) onDelete(std.id);
                  }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
