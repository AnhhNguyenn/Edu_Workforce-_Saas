export default function CenterAdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h2 className="text-2xl font-bold mb-1 text-edu-fg">Center Dashboard</h2>
        <p className="text-edu-muted text-sm">Quản lý trung tâm EduCenter Sài Gòn — Hôm nay</p>
      </div>
      
      <div className="bg-white rounded-2xl p-8 border border-edu-border shadow-sm text-center">
        <div className="w-16 h-16 bg-edu-accentLight text-edu-accent rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          📊
        </div>
        <h3 className="text-lg font-semibold text-edu-fg mb-2">Center Admin Dashboard Content</h3>
        <p className="text-edu-muted text-sm max-w-md mx-auto">
          Phân hệ Center Admin đã được tách biệt hoàn toàn bằng Route Groups. Logic BE sẽ được kết nối sau.
        </p>
      </div>
    </div>
  );
}
