export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Settings</h2>
        <p className="text-edu-muted text-sm">Cấu hình hệ thống chung</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
          <h3 className="font-semibold text-edu-fg mb-4">Thông tin hệ thống</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Tên platform</label>
              <input 
                type="text" 
                defaultValue="EduOps — Workforce Platform" 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Admin email</label>
              <input 
                type="text" 
                defaultValue="admin@eduops.vn" 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Timezone</label>
              <select className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface">
                <option>Asia/Ho_Chi_Minh (GMT+7)</option>
              </select>
            </div>
            <button className="mt-4 px-5 py-2.5 bg-edu-accent text-white rounded-lg text-sm font-semibold hover:bg-edu-accentHover transition-colors shadow-sm">
              Lưu thay đổi
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
          <h3 className="font-semibold text-edu-fg mb-4">Cấu hình GPS (Default)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Default check-in radius (m)</label>
              <input 
                type="number" 
                defaultValue={200} 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Cho phép check-in sớm (phút)</label>
              <input 
                type="number" 
                defaultValue={30} 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Đi trễ sau (phút)</label>
                <input 
                  type="number" 
                  defaultValue={15} 
                  className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
                />
              </div>
              <div>
                <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Checkout sớm (phút)</label>
                <input 
                  type="number" 
                  defaultValue={10} 
                  className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
                />
              </div>
            </div>
            <button className="mt-4 px-5 py-2.5 bg-edu-accent text-white rounded-lg text-sm font-semibold hover:bg-edu-accentHover transition-colors shadow-sm">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
