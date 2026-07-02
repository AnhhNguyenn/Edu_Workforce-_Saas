import { X, CheckCircle2, XCircle, MapPin, Image as ImageIcon } from 'lucide-react';
import { Portal } from '@/components/ui/portal';
import { useTodayAttendances } from '@/hooks/queries/useAttendances';
import { useUsers } from '@/hooks/queries/useUsers';

interface AttendanceModalProps {
  session: any;
  onClose: () => void;
}

export function AttendanceModal({ session, onClose }: AttendanceModalProps) {
  const { data: attendances } = useTodayAttendances();
  const { data: teachers } = useUsers('TEACHER');
  
  const teacherAttendance = attendances?.find((a: any) => a.sessionId === session.id && a.userId === session.teacherId);
  const teacherObj = teachers?.items?.find((t: any) => t.id === session.teacherId);
  
  const formatTime = (timeStr?: string) => timeStr ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Chi tiết Check-in Nhân sự</h2>
              <p className="text-sm text-slate-500 mt-1">Ca học: {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 sm:p-5 lg:p-6 bg-slate-50">
            {/* Giảng viên */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">GV</span>
                {teacherObj?.fullName || 'Chưa phân công'}
              </h3>
              
              {!teacherAttendance ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <XCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Chưa ghi nhận Check-in</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600 font-medium mb-1">Check-in lúc</p>
                      <p className="text-lg font-bold text-green-700">{formatTime(teacherAttendance.checkinTime)}</p>
                      {teacherAttendance.lateMinutes > 0 && <span className="text-xs text-red-500 block mt-1">Đi trễ {teacherAttendance.lateMinutes} phút</span>}
                    </div>
                    <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-600 font-medium mb-1">Check-out lúc</p>
                      <p className="text-lg font-bold text-orange-700">{formatTime(teacherAttendance.checkoutTime)}</p>
                      {teacherAttendance.earlyCheckoutMinutes > 0 && <span className="text-xs text-red-500 block mt-1">Về sớm {teacherAttendance.earlyCheckoutMinutes} phút</span>}
                    </div>
                  </div>
                  
                  {teacherAttendance.checkinImageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <ImageIcon size={16} /> Ảnh Selfie Check-in
                      </p>
                      <img src={teacherAttendance.checkinImageUrl} alt="Check-in Selfie" className="w-full h-48 object-cover rounded-lg border border-slate-200 shadow-sm" />
                    </div>
                  )}
                  
                  {teacherAttendance.note && (
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
                      <p className="text-sm font-semibold text-slate-700 mb-1">Ghi chú & Giải trình:</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{teacherAttendance.note}</p>
                    </div>
                  )}

                  {teacherAttendance.checkinLatitude && teacherAttendance.checkinLongitude && (
                    <div className="text-xs flex flex-col gap-1 text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        Tọa độ Check-in: {teacherAttendance.checkinLatitude}, {teacherAttendance.checkinLongitude}
                      </div>
                      {teacherAttendance.checkoutLatitude && teacherAttendance.checkoutLongitude && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          Tọa độ Check-out: {teacherAttendance.checkoutLatitude}, {teacherAttendance.checkoutLongitude}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Bạn có thể bổ sung block tương tự cho Trợ giảng nếu cần */}
          </div>
        </div>
      </div>
    </Portal>
  );
}
