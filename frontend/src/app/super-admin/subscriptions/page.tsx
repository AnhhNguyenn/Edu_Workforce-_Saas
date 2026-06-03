'use client';

import { Search, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMyTransactions } from '@/hooks/queries/useSubscriptions';
import { TransactionTable } from './_components/TransactionTable';

export default function SubscriptionsPage() {
  const { data: transactions = [], isLoading } = useMyTransactions();

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Gói dịch vụ (SaaS)</h2>
          <p className="text-edu-muted text-sm">Quản lý các gói đăng ký của tổ chức, doanh thu và hóa đơn</p>
        </div>
        <Button className="gap-2 bg-edu-accent hover:bg-blue-700">
          <ArrowUpRight size={18} />
          Nâng cấp Gói
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-edu-accent to-blue-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20"><CheckCircle2 size={64} /></div>
          <div className="text-blue-100 text-sm font-medium mb-1">Gói hiện tại</div>
          <h3 className="text-3xl font-bold mb-4">Enterprise</h3>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-blue-100 text-xs">Giá hạn tiếp theo</div>
              <div className="font-semibold mt-0.5">25/04/2025</div>
            </div>
            <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Đang hoạt động
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-edu-border shadow-sm flex flex-col justify-center">
          <div className="text-edu-muted text-sm font-medium mb-1">Tổng chi tiêu (Năm nay)</div>
          <h3 className="text-3xl font-bold text-edu-fg">16,700,000 đ</h3>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h3 className="text-lg font-bold text-edu-fg">Lịch sử giao dịch</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={16} />
            <Input placeholder="Tìm mã hóa đơn..." className="pl-9 h-9 text-sm" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white">
            <Filter size={16} className="text-edu-muted" />
          </Button>
        </div>
      </div>

      <TransactionTable transactions={transactions} isLoading={isLoading} />
    </div>
  );
}
