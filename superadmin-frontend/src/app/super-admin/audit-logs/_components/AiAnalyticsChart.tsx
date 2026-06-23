import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { DollarSign, Cpu, TrendingUp } from 'lucide-react';

interface AiAnalyticsChartProps {
  logs: any[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function AiAnalyticsChart({ logs }: AiAnalyticsChartProps) {
  // Extract and parse AI logs
  const aiLogs = useMemo(() => {
    return logs
      .filter((log) => log.action === 'AI_USAGE_LOG')
      .map((log) => {
        try {
          const data = JSON.parse(log.newData);
          return {
            date: new Date(log.createdAt),
            cost: data.TotalCost || 0,
            model: data.Model || 'Unknown',
            provider: data.Provider || 'Unknown',
            tokens: (data.HitTokens || 0) + (data.MissTokens || 0) + (data.OutputTokens || 0)
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as any[];
  }, [logs]);

  // Aggregate Data for Cost Trend (Last 7 Days)
  const trendData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const today = new Date();
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      dataMap[format(d, 'dd/MM')] = 0;
    }

    aiLogs.forEach(log => {
      const dayKey = format(log.date, 'dd/MM');
      if (dataMap[dayKey] !== undefined) {
        dataMap[dayKey] += log.cost;
      }
    });

    return Object.keys(dataMap).map(key => ({
      date: key,
      cost: dataMap[key]
    }));
  }, [aiLogs]);

  // Aggregate Data for Model Distribution (Pie Chart)
  const modelData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    aiLogs.forEach(log => {
      if (!dataMap[log.model]) {
        dataMap[log.model] = 0;
      }
      dataMap[log.model] += log.cost;
    });

    return Object.keys(dataMap).map(key => ({
      name: key,
      value: dataMap[key]
    })).sort((a, b) => b.value - a.value); // Sort descending
  }, [aiLogs]);

  const totalCost = aiLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalTokens = aiLogs.reduce((acc, log) => acc + log.tokens, 0);

  if (aiLogs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="md:col-span-1 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <DollarSign size={20} />
            <h3 className="font-medium text-sm">Tổng Chi Phí (USD)</h3>
          </div>
          <p className="text-3xl font-bold">${totalCost.toFixed(4)}</p>
          <div className="mt-4 pt-4 border-t border-white/20 text-xs opacity-80 flex items-center gap-1">
            <TrendingUp size={14} /> Toàn thời gian
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-edu-border shadow-sm flex-1">
          <div className="flex items-center gap-2 mb-2 text-edu-muted">
            <Cpu size={20} />
            <h3 className="font-medium text-sm">Tổng Tokens Tiêu Thụ</h3>
          </div>
          <p className="text-2xl font-bold text-edu-fg">{totalTokens.toLocaleString()}</p>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div className="bg-white rounded-2xl p-5 border border-edu-border shadow-sm md:col-span-1">
        <h3 className="font-semibold text-edu-fg mb-4">Chi phí 7 ngày qua</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `$${val}`} />
              <RechartsTooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Chi phí']}
              />
              <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Distribution Chart */}
      <div className="bg-white rounded-2xl p-5 border border-edu-border shadow-sm md:col-span-1 flex flex-col">
        <h3 className="font-semibold text-edu-fg mb-1">Cơ cấu Model AI</h3>
        <p className="text-xs text-edu-muted mb-4">Phân bổ chi phí theo từng mô hình</p>
        <div className="flex-1 min-h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modelData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {modelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Chi phí']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
