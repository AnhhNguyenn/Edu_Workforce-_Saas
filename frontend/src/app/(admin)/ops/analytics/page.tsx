'use client';

import React from 'react';
import { CalendarDays, CheckCircle2, Clock, FileText, TrendingUp, Users, GraduationCap, Search, CreditCard, Download, Receipt } from "lucide-react";
import { useClasses } from "@/hooks/queries/useClasses";
import { useReports } from "@/hooks/queries/useReports";
import { useSessions } from "@/hooks/queries/useSessions";
import { useUsers } from "@/hooks/queries/useUsers";
import { useAttendanceStats, useStaffAttendanceStats } from "@/hooks/queries/useAttendances";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AnalyticsPage() {
  const { data: classes } = useClasses();
  const { data: reports } = useReports();
  const { data: sessions } = useSessions();
  const { data: teachers } = useUsers('TEACHER');
  const { data: assistants } = useUsers('TEACHING_ASSISTANT');
  const { data: attendanceStats } = useAttendanceStats(7);

  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(new Date().getFullYear());
  const [roleFilter, setRoleFilter] = React.useState('ALL');
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const { data: staffStats } = useStaffAttendanceStats(selectedMonth, selectedYear);

  // Filter staff stats based on role + search keyword
  const displayedStaffStats = React.useMemo(() => {
    if (!staffStats) return [];
    let filtered = [...staffStats];
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((s: any) => s.role === roleFilter);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter((s: any) => s.fullName?.toLowerCase().includes(kw) || s.email?.toLowerCase().includes(kw));
    }
    return filtered;
  }, [staffStats, roleFilter, searchKeyword]);

  // Map real data for Attendance Area Chart
  const attendanceData = attendanceStats?.map((stat) => ({
    name: stat.date,
    percent: stat.attendanceRate,
    checkedIn: stat.checkedInCount,
    total: stat.totalSessions
  })) || [];

  return (
    <div className="w-full h-full space-y-7">
      <div className="mb-7 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Thống kê trung tâm</h2>
          <p className="text-edu-muted text-sm">Phân tích hiệu suất & tình hình hoạt động</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<CalendarDays size={20} />} label="Ca học (Tổng)" value={sessions?.totalCount?.toString() || "0"} type="accent" trend="+12% tuần này" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Lớp đang mở" value={classes?.totalCount?.toString() || "0"} type="success" trend="Hoạt động tốt" />
        <StatCard icon={<Clock size={20} />} label="Giáo viên" value={teachers?.totalCount?.toString() || "0"} type="warn" trend="+2 nhân sự mới" />
        <StatCard icon={<FileText size={20} />} label="Báo cáo đã gửi" value={reports?.totalCount?.toString() || "0"} type="danger" trend="Cần xử lý" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 mb-7">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-base text-edu-fg flex items-center gap-2">
              <TrendingUp size={18} className="text-edu-success" /> Tỷ lệ chuyên cần (Check-in nhân sự) - 7 ngày qua
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string, props: any) => [`${value}% (${props.payload.checkedIn}/${props.payload.total} ca)`, 'Tỷ lệ']}
                />
                <Area type="monotone" dataKey="percent" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          <div className="font-semibold text-base text-edu-fg mb-4">Chi tiết các lớp học gần đây</div>
          <div className="flex flex-col">
            {classes?.items && classes.items.length > 0 ? (
              classes.items.slice(0, 5).map((c, i) => {
                const colors = [
                  'bg-blue-500', 
                  'bg-emerald-500', 
                  'bg-purple-500', 
                  'bg-orange-500', 
                  'bg-rose-500'
                ];
                const bgColor = colors[i % colors.length];
                
                return (
                <div key={c.id} className={`flex justify-between items-center py-3 ${i < Math.min(classes.items.length - 1, 4) ? 'border-b border-edu-border' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${bgColor}`}>
                      <GraduationCap size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-edu-fg">{c.name}</span>
                      <span className="text-xs text-edu-muted">{c.academicYear || 'Chưa cập nhật niên khóa'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-edu-muted flex items-center gap-1"><Users size={14}/> Sĩ số: <strong className="text-edu-fg">{c.studentsCount || 0}</strong></span>
                    <span className={`font-semibold px-2.5 py-1 rounded-md text-xs ${c.statusCode === 'ACTIVE' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-gray-100 text-gray-600'}`}>
                      {c.statusCode === 'ACTIVE' ? 'Đang mở' : 'Chưa mở'}
                    </span>
                  </div>
                </div>
              )})
            ) : (
              <div className="text-center py-5 text-edu-muted">Chưa có dữ liệu lớp học</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
          {/* Header + Filters */}
          <div className="flex flex-col gap-4 mb-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-edu-fg">Thống kê chuyên cần</h3>
              <div className="flex items-center gap-2">
                <Select 
                  options={[
                    { value: 'ALL', label: 'Tất cả' },
                    ...Array.from({ length: 12 }).map((_, i) => ({ value: (i+1).toString(), label: `Tháng ${i+1}` }))
                  ]}
                  value={selectedMonth?.toString() || 'ALL'}
                  onChange={(v) => {
                    if (v === 'ALL') { setSelectedMonth(null); } 
                    else { setSelectedMonth(parseInt(v)); if (!selectedYear) setSelectedYear(new Date().getFullYear()); }
                  }}
                  className="w-[140px]"
                />
                <Select 
                  options={[
                    { value: 'ALL', label: 'Năm' },
                    ...Array.from({ length: 5 }).map((_, i) => {
                      const y = new Date().getFullYear() - i;
                      return { value: y.toString(), label: y.toString() };
                    })
                  ]}
                  value={selectedYear?.toString() || 'ALL'}
                  onChange={(v) => {
                    if (v === 'ALL') { setSelectedYear(null); } 
                    else { setSelectedYear(parseInt(v)); }
                  }}
                  className="w-[120px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên nhân sự..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-edu-border rounded-lg bg-gray-50/50 outline-none focus:border-edu-accent focus:ring-2 focus:ring-edu-accentLight/50 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  options={[
                    { value: 'ALL', label: 'Tất cả vai trò' },
                    { value: 'TEACHER', label: 'Giáo viên' },
                    { value: 'TEACHING_ASSISTANT', label: 'Trợ giảng' }
                  ]}
                  value={roleFilter}
                  onChange={(v) => setRoleFilter(v)}
                  className="w-[140px]"
                />
              </div>
            </div>
          </div>
          
          {/* Staff List */}
          <div className="flex flex-col gap-0 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {displayedStaffStats && displayedStaffStats.length > 0 ? (
                displayedStaffStats.map((stat: any, index: number) => (
                  <div key={stat.userId} className={`flex items-center justify-between py-3 ${index !== displayedStaffStats.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${stat.role === 'TEACHER' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                        {stat.fullName.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">{stat.fullName}</span>
                        <span className="text-[11px] text-slate-400">{stat.role === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng'} • {stat.totalSessions} ca</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold ${stat.attendanceRate >= 90 ? 'text-green-600' : stat.attendanceRate >= 75 ? 'text-orange-500' : 'text-red-500'}`}>
                        {stat.attendanceRate}%
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium">
                        {stat.lateCount > 0 && <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Trễ {stat.lateCount}</span>}
                        {stat.earlyCheckoutCount > 0 && <span className="text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">Sớm {stat.earlyCheckoutCount}</span>}
                        {stat.absentCount > 0 && <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Vắng {stat.absentCount}</span>}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
                <div className="text-center py-10 text-slate-400 italic text-sm">Không có dữ liệu chuyên cần</div>
            )}
          </div>
        </div>
      </div>

      {/* Lịch sử thanh toán gói cước */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-edu-border hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-semibold text-base text-edu-fg flex items-center gap-2">
              <CreditCard size={18} className="text-edu-accent" /> Lịch sử thanh toán
            </h3>
            <p className="text-xs text-edu-muted mt-1">Danh sách các giao dịch gia hạn gói cước phần mềm</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Giao Dịch</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Gói cước</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Khuyến mãi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <EmptyState 
                  icon={<Receipt size={32} />}
                  title="Chưa có dữ liệu thanh toán"
                  description="Hiện tại hệ thống chưa ghi nhận giao dịch thanh toán gói cước nào."
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, type, trend }: { icon: React.ReactNode, label: string, value: string, type: 'accent' | 'success' | 'warn' | 'danger', trend?: string }) {
  const colors = {
    accent: { bg: 'bg-edu-accentLight', text: 'text-edu-accent', circle: 'after:bg-edu-accent' },
    success: { bg: 'bg-edu-successLight', text: 'text-edu-success', circle: 'after:bg-edu-success' },
    warn: { bg: 'bg-edu-warnLight', text: 'text-edu-warn', circle: 'after:bg-edu-warn' },
    danger: { bg: 'bg-edu-dangerLight', text: 'text-edu-danger', circle: 'after:bg-edu-danger' },
  };
  const c = colors[type];

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-edu-border hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:opacity-10 ${c.circle}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg flex items-baseline gap-2">
        {value}
        {trend && <span className="text-xs font-medium text-gray-400 font-sans tracking-wide">{trend}</span>}
      </div>
      <div className="text-xs text-edu-muted mt-1">{label}</div>
    </div>
  );
}

