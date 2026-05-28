'use client';

import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { REPORTS } from "@/lib/mock-data";

export default function ReportsPage() {
  const handleExport = () => {
    const headers = ['Ngày', 'Lớp học', 'Giáo viên', 'Sĩ số hiện diện', 'Trạng thái báo cáo'];
    const csvContent = [
      headers.join(','),
      ...REPORTS.map(r => `"${r.date}","${r.cls}","${r.teacher}","${r.attendance}","${r.status}"`)
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_diem_danh_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Báo cáo điểm danh</h2>
          <p className="text-edu-muted text-sm">Theo dõi tiến độ nộp báo cáo điểm danh của giáo viên</p>
        </div>
        <Button className="gap-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white" onClick={handleExport}>
          <Download size={18} />
          Xuất file Excel
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4 bg-gray-50/50">
          <div className="flex flex-1 max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input placeholder="Tìm tên giáo viên, lớp học..." className="pl-9 h-9 text-sm focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
            </div>
            <div className="w-40">
              <Select 
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'submitted', label: 'Đã nộp' },
                  { value: 'missing', label: 'Chưa nộp' }
                ]}
                placeholder="Trạng thái"
                className="h-9 focus:border-[#4CAF50] focus:ring-[#4CAF50]/30 w-full"
              />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Lớp học</TableHead>
              <TableHead>Giáo viên</TableHead>
              <TableHead>Sĩ số hiện diện</TableHead>
              <TableHead>Trạng thái báo cáo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REPORTS.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.date}</TableCell>
                <TableCell className="font-bold text-[#2E7D32]">{r.cls}</TableCell>
                <TableCell>{r.teacher}</TableCell>
                <TableCell className="font-semibold text-edu-fg">{r.attendance}</TableCell>
                <TableCell>
                  <Badge variant={
                    r.status === 'submitted' ? 'success' : 
                    r.status === 'missing' ? 'danger' : 'warn'
                  }>
                    {r.status === 'submitted' ? 'Đã nộp' : r.status === 'missing' ? 'Chưa nộp' : 'Bản nháp'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" className="hover:border-[#4CAF50] hover:text-[#4CAF50]">
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
