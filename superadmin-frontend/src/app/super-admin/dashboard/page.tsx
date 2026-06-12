'use client';

import { Building2, Users, Calendar, UserCheck, MapPin, Clock, CreditCard } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useSystemOverview, useSystemCharts } from "@/hooks/queries/useAnalytics";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useSystemOverview();
  const { data: charts, isLoading: isChartsLoading } = useSystemCharts();

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Dashboard</h2>
        <p className="text-edu-muted text-sm">Tổng quan hệ thống SaaS — Hôm nay, {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* STATS GRID */}
      {isLoading ? (
        <div className="text-center text-edu-muted py-10">Đang tải dữ liệu tổng quan...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard icon={<Building2 size={20} />} label="Tổng số Tenants" value={stats?.totalOrganizations || 0} type="accent" />
          <StatCard icon={<Users size={20} />} label="Tổng Giáo viên" value={stats?.totalUsers || 0} type="success" />
          <StatCard icon={<UserCheck size={20} />} label="Active Users" value={stats?.activeUsers || 0} type="warn" />
          <StatCard icon={<CreditCard size={20} />} label="Tổng doanh thu" value={stats?.totalRevenue ? `${(stats.totalRevenue).toLocaleString()} đ` : '0 đ'} type="danger" />
        </div>
      )}

      {/* GRID 2-1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-5">
            <span className="font-semibold text-base text-edu-fg">Tăng trưởng Doanh thu theo tháng</span>
            <span className="bg-edu-accentLight text-edu-accent px-2.5 py-1 rounded-full text-xs font-bold">6 tháng</span>
          </div>
          <div className="h-60 rounded-lg relative flex items-end pt-5 w-full">
            {isChartsLoading ? (
              <div className="w-full h-full flex justify-center items-center text-edu-muted">Đang tải biểu đồ...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.revenueChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                  <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6 hover:shadow-md transition-shadow flex flex-col">
          <div className="font-semibold text-base text-edu-fg mb-4">Tăng trưởng Tenant</div>
          
          <div className="flex-1 min-h-[150px]">
            {isChartsLoading ? (
               <div className="w-full h-full flex justify-center items-center text-edu-muted">Đang tải biểu đồ...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.tenantChart || []} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip />
                  <Bar dataKey="tenants" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-edu-border">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-edu-fg">Tháng này</span>
                <span className="text-sm font-bold text-edu-success">+{charts?.currentMonthNewTenants || 0}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-edu-fg">Tháng trước</span>
                <span className="text-sm font-semibold text-edu-muted">+{charts?.lastMonthNewTenants || 0}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

