import { X, CheckCircle2, XCircle, MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Portal } from '@/components/ui/portal';
import { useTodayAttendances, useConfirmExplanation } from '@/hooks/queries/useAttendances';
import { useUsers } from '@/hooks/queries/useUsers';

interface AttendanceModalProps {
  session: any;
  onClose: () => void;
}

export function AttendanceModal({ session, onClose }: AttendanceModalProps) {
  const sessionDateStr = session?.sessionDate ? new Date(session.sessionDate).toLocaleDateString('en-CA') : undefined;
  const { data: attendances } = useTodayAttendances(sessionDateStr);
  const { data: teachers } = useUsers('TEACHER');
  const { data: assistants } = useUsers('ASSISTANT');
  const { mutate: confirmExplanation, isPending: isConfirming } = useConfirmExplanation();
  
  const assignedTeacherIds = (session.teacherIds && session.teacherIds.length > 0) ? session.teacherIds : (session.teacherId ? [session.teacherId] : []);
  const assignedAssistantIds = (session.assistantIds && session.assistantIds.length > 0) ? session.assistantIds : (session.assistantId ? [session.assistantId] : []);
  
  const assignedStaff = [
    ...assignedTeacherIds.map((id: string) => ({ id, role: 'TEACHER' })),
    ...assignedAssistantIds.map((id: string) => ({ id, role: 'ASSISTANT' }))
  ];
  
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
          
          <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 max-h-[70vh] overflow-y-auto space-y-4">
            {assignedStaff.map((staff, idx) => {
              const staffObj = staff.role === 'TEACHER'
                ? teachers?.items?.find((t: any) => t.id === staff.id)
                : assistants?.items?.find((a: any) => a.id === staff.id);
              const staffName = staffObj?.fullName || (staff.role === 'TEACHER' ? 'Giáo viên' : 'Trợ giảng');
              const staffRoleLabel = staff.role === 'TEACHER' ? 'GV' : 'TG';
              const staffRoleBg = staff.role === 'TEACHER' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600';
              const staffAttendance = attendances?.find((a: any) => a.sessionId === session.id && a.userId === staff.id);

              return (
                <div key={staff.id + '-' + idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${staffRoleBg}`}>{staffRoleLabel}</span>
                    {staffName}
                  </h3>
                  
                  {!staffAttendance ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <XCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 font-medium">Chưa ghi nhận Check-in</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                          <p className="text-xs text-green-600 font-medium mb-1">Check-in lúc</p>
                          <p className="text-lg font-bold text-green-700">{formatTime(staffAttendance.checkinTime)}</p>
                          {staffAttendance.lateMinutes > 0 && <span className="text-xs text-red-500 block mt-1">Đi trễ {staffAttendance.lateMinutes} phút</span>}
                        </div>
                        <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                          <p className="text-xs text-orange-600 font-medium mb-1">Check-out lúc</p>
                          <p className="text-lg font-bold text-orange-700">{formatTime(staffAttendance.checkoutTime)}</p>
                          {staffAttendance.earlyCheckoutMinutes > 0 && <span className="text-xs text-red-500 block mt-1">Về sớm {staffAttendance.earlyCheckoutMinutes} phút</span>}
                        </div>
                      </div>
                      
                      {staffAttendance.checkinImageUrl && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <ImageIcon size={16} /> Ảnh Selfie Check-in
                          </p>
                          <img src={staffAttendance.checkinImageUrl} alt="Check-in Selfie" className="w-full h-48 object-cover rounded-lg border border-slate-200 shadow-sm" />
                        </div>
                      )}
                      
                      {staffAttendance.note && (
                        <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-slate-700">Ghi chú & Giải trình:</p>
                            {staffAttendance.note.includes('[Quản lý đã xác nhận]') ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 size={12} /> Đã duyệt giải trình
                              </span>
                            ) : (
                              <button
                                onClick={() => confirmExplanation(staffAttendance.id)}
                                disabled={isConfirming}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 px-2.5 py-1 rounded-full border border-blue-200 transition-colors flex items-center gap-1 shadow-sm"
                              >
                                {isConfirming && <Loader2 className="animate-spin" size={10} />}
                                Duyệt giải trình
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">
                            {staffAttendance.note.replace('[Quản lý đã xác nhận]', '').trim()}
                          </p>
                        </div>
                      )}

                      {staffAttendance.checkinLatitude && staffAttendance.checkinLongitude && (
                        <div className="text-xs flex flex-col gap-1 text-slate-500 mt-2">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            Tọa độ Check-in: {staffAttendance.checkinLatitude}, {staffAttendance.checkinLongitude}
                          </div>
                          {staffAttendance.checkoutLatitude && staffAttendance.checkoutLongitude && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              Tọa độ Check-out: {staffAttendance.checkoutLatitude}, {staffAttendance.checkoutLongitude}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {assignedStaff.length === 0 && (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
                <p className="text-slate-400 italic">Không có nhân sự được phân công</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
