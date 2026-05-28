import { ORGANIZATIONS } from "@/lib/mock-data";
import { Package } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Subscriptions</h2>
        <p className="text-edu-muted text-sm">Quản lý gói dịch vụ và thanh toán</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
        <StatBox title="Gói Starter" value="3" type="accent" />
        <StatBox title="Gói Professional" value="3" type="success" />
        <StatBox title="Gói Enterprise" value="2" type="warn" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-5 border-b border-edu-border">
          <h3 className="font-semibold text-edu-fg">Chi tiết Subscription</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-edu-bg">
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Trung tâm</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Plan</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Max Teachers</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Usage</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Ngày hết hạn</th>
                <th className="py-3 px-5 text-[0.75rem] font-semibold uppercase tracking-wider text-edu-muted border-b border-edu-border">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {ORGANIZATIONS.map((o, i) => {
                const max = o.plan === 'Enterprise' ? 100 : o.plan === 'Professional' ? 50 : 20;
                const pct = Math.round((o.teachers / max) * 100);
                const badgeColor = o.plan === 'Enterprise' ? 'bg-edu-warnLight text-edu-warn' : o.plan === 'Professional' ? 'bg-edu-accentLight text-edu-accent' : 'bg-gray-100 text-edu-muted';
                const progressColor = pct > 90 ? 'bg-edu-danger' : pct > 70 ? 'bg-edu-warn' : 'bg-edu-accent';
                
                return (
                  <tr key={i} className="hover:bg-edu-accentLighter transition-colors">
                    <td className="py-3.5 px-5 border-b border-edu-border font-semibold text-edu-fg">{o.name}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${badgeColor}\`}>
                        {o.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm font-medium">{max}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-edu-bg rounded-full overflow-hidden">
                          <div className={\`h-full rounded-full \${progressColor}\`} style={{ width: \`\${pct}%\` }}></div>
                        </div>
                        <span className="text-xs font-bold text-edu-fg">{o.teachers}/{max}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-b border-edu-border text-sm text-edu-fgSecondary">{o.expires}</td>
                    <td className="py-3.5 px-5 border-b border-edu-border">
                      <span className={\`font-semibold text-[0.75rem] px-2.5 py-1 rounded-full \${o.status === 'active' ? 'bg-edu-successLight text-edu-success' : 'bg-edu-dangerLight text-edu-danger'}\`}>
                        {o.status === 'active' ? 'Đã thanh toán' : 'Quá hạn'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ title, value, type }: { title: string, value: string, type: 'accent' | 'success' | 'warn' }) {
  const colors = {
    accent: { bg: 'bg-edu-accentLight', text: 'text-edu-accent' },
    success: { bg: 'bg-edu-successLight', text: 'text-edu-success' },
    warn: { bg: 'bg-edu-warnLight', text: 'text-edu-warn' },
  };
  const c = colors[type];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-edu-border flex flex-col justify-center">
      <div className={\`w-10 h-10 rounded-lg flex items-center justify-center mb-3 \${c.bg} \${c.text}\`}>
        <Package size={20} />
      </div>
      <div className="text-3xl font-bold leading-tight text-edu-fg">{value}</div>
      <div className="text-xs text-edu-muted mt-1">{title}</div>
    </div>
  );
}
