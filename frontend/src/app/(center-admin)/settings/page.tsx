export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Settings</h2>
        <p className="text-edu-muted text-sm">Cấu hình hệ thống trung tâm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
          <h3 className="font-semibold text-edu-fg mb-4">Thông tin trung tâm</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Tên trung tâm</label>
              <input 
                type="text" 
                defaultValue="EduCenter Sài Gòn" 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Địa chỉ</label>
              <input 
                type="text" 
                defaultValue="123 Nguyễn Huệ, Q.1, TP.HCM" 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Email liên hệ</label>
                <input 
                  type="text" 
                  defaultValue="admin@educenter.vn" 
                  className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
                />
              </div>
              <div>
                <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Số điện thoại</label>
                <input 
                  type="text" 
                  defaultValue="0901 234 567" 
                  className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
                />
              </div>
            </div>
            <button className="mt-4 px-5 py-2.5 bg-edu-accent text-white rounded-lg text-sm font-semibold hover:bg-edu-accentHover transition-colors shadow-sm">
              Lưu thay đổi
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden p-6">
          <h3 className="font-semibold text-edu-fg mb-4">Quy tắc Attendance</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Cho phép check-in sớm (phút)</label>
              <input 
                type="number" 
                defaultValue={30} 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Đi trễ sau (phút)</label>
              <input 
                type="number" 
                defaultValue={15} 
                className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">Checkout sớm (phút)</label>
                <input 
                  type="number" 
                  defaultValue={10} 
                  className="w-full px-3.5 py-2.5 rounded-lg border border-edu-border text-sm focus:border-edu-accent outline-none focus:ring-1 focus:ring-edu-accent transition-all bg-edu-surface"
                />
              </div>
              <div>
                <label className="block text-[0.8rem] font-semibold text-edu-fgSecondary mb-1.5">GPS radius mặc định (m)</label>
                <input 
                  type="number" 
                  defaultValue={200} 
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
