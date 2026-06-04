'use client';

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemErrorRates } from "@/hooks/queries/useAnalytics";

import { FeatureGuard } from '@/components/ui/feature-guard';

export default function AnalyticsPage() {
  const { data: errors, isLoading } = useSystemErrorRates();

  return (
    <FeatureGuard featureKey="FEATURE_ANALYTICS">
      <div className="max-w-7xl mx-auto space-y-7">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-edu-fg">System Analytics</h2>
            <p className="text-edu-muted text-sm">Phân tích chuyên sâu về tương tác người dùng và lỗi hệ thống</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">7 ngày qua</Button>
            <Button variant="secondary">30 ngày qua</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-edu-muted py-10">Đang tải dữ liệu phân tích...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6">
              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold text-base text-edu-fg">Tổng API Requests</span>
                <span className="text-xs font-bold text-edu-success bg-edu-successLight px-2 py-1 rounded-md flex items-center gap-1">
                  <ArrowUpRight size={14} /> Tăng 5%
                </span>
              </div>
              <div className="text-3xl font-bold text-edu-fg mb-6">{errors?.totalRequests?.toLocaleString() || '1,200,000'} <span className="text-sm font-medium text-edu-muted">req/month</span></div>
              
              {/* CSS Wave Chart Placeholder */}
              <div className="h-40 rounded-lg relative overflow-hidden flex items-end pt-5">
                 <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
                  <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" className="fill-edu-accentLight/50" />
                  <path d="M0,60 C150,160 350,10 500,60" className="stroke-edu-accent stroke-2 fill-none" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6">
              <div className="font-semibold text-base text-edu-fg mb-5">Tỷ lệ Lỗi (Error Rates)</div>
              <div className="text-3xl font-bold text-edu-fg mb-6">{( ((errors?.serverErrors || 15) + (errors?.unauthorized || 45) + (errors?.notFound || 120)) / (errors?.totalRequests || 1200000) * 100 ).toFixed(3)}% <span className="text-sm font-medium text-edu-muted">Cực thấp</span></div>
              
              <div className="flex flex-col gap-4 mt-2">
                {[
                  { label: '5xx Server Errors', val: errors?.serverErrors || 0, pct: ((errors?.serverErrors || 0)/(errors?.totalRequests||1)*100).toFixed(4) + '%' },
                  { label: '401 Unauthorized', val: errors?.unauthorized || 0, pct: ((errors?.unauthorized || 0)/(errors?.totalRequests||1)*100).toFixed(4) + '%' },
                  { label: '404 Not Found', val: errors?.notFound || 0, pct: ((errors?.notFound || 0)/(errors?.totalRequests||1)*100).toFixed(4) + '%' }
                ].map((err, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-edu-fg w-32">{err.label}</span>
                    <div className="flex-1 h-2.5 bg-edu-bg rounded-full overflow-hidden">
                      <div className="h-full bg-edu-danger rounded-full" style={{ width: `\${Math.min(err.val / 10, 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold w-20 text-right text-edu-muted">{err.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border p-6">
            <div className="font-semibold text-base text-edu-fg mb-5">Nền tảng sử dụng (Devices)</div>
            <div className="flex gap-10">
              <div className="flex-1 max-w-[200px]">
                {/* CSS Donut Chart Placeholder */}
                <div className="relative w-40 h-40 mx-auto rounded-full bg-edu-bg" style={{ background: 'conic-gradient(#4DA3FF 0% 65%, #FF8A65 65% 90%, #81C784 90% 100%)' }}>
                   <div className="absolute inset-[15%] bg-white rounded-full flex items-center justify-center">
                      <span className="font-bold text-xl">100%</span>
                   </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#4DA3FF]"></div>
                   <span className="text-sm font-medium flex-1">Desktop (Web)</span>
                   <span className="text-sm font-bold">65%</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#FF8A65]"></div>
                   <span className="text-sm font-medium flex-1">Mobile (PWA/Browser)</span>
                   <span className="text-sm font-bold">25%</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#81C784]"></div>
                   <span className="text-sm font-medium flex-1">Tablet</span>
                   <span className="text-sm font-bold">10%</span>
                 </div>
              </div>
            </div>
        </div>
      </div>
    </FeatureGuard>
  );
}

