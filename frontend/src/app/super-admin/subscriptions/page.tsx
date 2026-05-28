'use client';

import { Search, Filter, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const INVOICES = [
  { id: 'INV-2024-001', org: 'EduCenter Sài Gòn', amount: '12,500,000đ', plan: 'Enterprise (Năm)', date: '25/04/2024', status: 'paid' },
  { id: 'INV-2024-002', org: 'Trung tâm Anh ngữ Hà Nội', amount: '4,200,000đ', plan: 'Professional (Quý)', date: '22/04/2024', status: 'paid' },
  { id: 'INV-2024-003', org: 'STEM Academy Đà Nẵng', amount: '1,500,000đ', plan: 'Starter (Tháng)', date: '20/04/2024', status: 'pending' },
  { id: 'INV-2024-004', org: 'MathKids Cần Thơ', amount: '4,200,000đ', plan: 'Professional (Quý)', date: '15/04/2024', status: 'paid' },
];

export default function SubscriptionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Subscriptions & Billing</h2>
          <p className="text-edu-muted text-sm">Quản lý gói dịch vụ và thanh toán của các trung tâm</p>
        </div>
        <Button className="gap-2">
          Gia hạn thủ công
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="text-edu-muted text-sm font-semibold mb-2">Doanh thu tháng này (MRR)</div>
          <div className="text-3xl font-bold text-edu-fg">84.5M ₫</div>
          <div className="text-[0.75rem] font-semibold text-edu-success mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> +12% so với tháng trước
          </div>
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-edu-successLight rounded-full opacity-20"></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="text-edu-muted text-sm font-semibold mb-2">Trung tâm gia hạn</div>
          <div className="text-3xl font-bold text-edu-fg">92%</div>
          <div className="text-[0.75rem] font-semibold text-edu-success mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> Tăng nhẹ (Avg. 90%)
          </div>
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-edu-accentLight rounded-full opacity-20"></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="text-edu-muted text-sm font-semibold mb-2">Dự kiến tháng sau</div>
          <div className="text-3xl font-bold text-edu-fg">91.0M ₫</div>
          <div className="text-[0.75rem] font-semibold text-edu-muted mt-2">
            Từ 15 trung tâm tái ký hợp đồng
          </div>
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-purple-100 rounded-full opacity-20"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-edu-border gap-4 bg-gray-50/50">
          <h3 className="text-base font-semibold text-edu-fg">Lịch sử thanh toán</h3>
          <div className="flex flex-1 max-w-sm gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
              <Input placeholder="Mã hóa đơn, trung tâm..." className="pl-9 h-9 text-sm" />
            </div>
            <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HĐ</TableHead>
              <TableHead>Trung tâm</TableHead>
              <TableHead>Gói đăng ký</TableHead>
              <TableHead>Thành tiền</TableHead>
              <TableHead>Ngày xuất</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-semibold text-edu-fg">{inv.id}</TableCell>
                <TableCell className="font-medium">{inv.org}</TableCell>
                <TableCell className="text-edu-fgSecondary">{inv.plan}</TableCell>
                <TableCell className="font-bold text-edu-accent">{inv.amount}</TableCell>
                <TableCell className="text-edu-muted">{inv.date}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warn'}>
                    {inv.status === 'paid' ? 'Đã thanh toán' : 'Chờ xử lý'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
