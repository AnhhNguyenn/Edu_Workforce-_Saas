import { Modal } from "@/components/ui/modal";
import { useSessionReport } from "@/hooks/queries/useReports";
import { Loader2, FileText, User, Users, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any | null;
}

export function ReportModal({ isOpen, onClose, session }: ReportModalProps) {
  const { data: report, isLoading } = useSessionReport(session?.id || '');

  if (!isOpen || !session) return null;

  const renderMedia = () => {
    if (!report?.mediaUrls || report.mediaUrls.length === 0) return null;
    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">Đính kèm (Hình ảnh/Video):</h4>
        <div className="flex flex-wrap gap-2">
          {report.mediaUrls.map((url: string, idx: number) => {
            const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
            if (isVideo) {
              return (
                <video key={idx} src={url} controls className="h-32 rounded-lg border border-slate-200" />
              );
            }
            return (
              <img key={idx} src={url} alt={`Media ${idx}`} className="h-32 rounded-lg object-cover border border-slate-200" />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="text-edu-accent" />
          Chi tiết Báo cáo buổi học
        </div>
      }
      className="max-w-2xl"
    >
      <div className="text-slate-500 mb-4 -mt-2">
        Xem nội dung báo cáo của giáo viên và trợ giảng cho ca học này.
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="animate-spin text-edu-accent mb-4 h-8 w-8" />
          <span className="text-slate-500">Đang tải báo cáo...</span>
        </div>
      ) : !report ? (
          <div className="py-8">
            <EmptyState description="Chưa có báo cáo nào được nộp cho ca học này." />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            
            {/* Overview Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-slate-800">{session.lessonTitle || 'Lý thuyết'}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12}/> {session.startTime?.substring(0,5)} - {session.endTime?.substring(0,5)}</div>
                </div>
                <Badge variant="success">Đã nộp báo cáo</Badge>
              </div>
              <div className="flex gap-6 text-sm text-slate-700">
                <div className="flex items-center gap-1.5"><User size={14} className="text-blue-500"/> Sĩ số: <span className="font-semibold">{report.attendanceCount + report.absentCount}</span></div>
                <div className="flex items-center gap-1.5"><User size={14} className="text-emerald-500"/> Có mặt: <span className="font-semibold">{report.attendanceCount}</span></div>
                <div className="flex items-center gap-1.5"><User size={14} className="text-red-500"/> Vắng: <span className="font-semibold text-red-500">{report.absentCount}</span></div>
              </div>
            </div>

            {/* Teacher Report */}
            {(report.lessonTaught || report.progress || report.teacherComment || report.specialStudents) && (
              <div className="space-y-3">
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <User className="text-blue-500" size={18} />
                  Báo cáo của Giáo viên
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {report.lessonTaught && (
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs font-semibold text-blue-800 uppercase mb-1">Nội dung bài dạy</div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">{report.lessonTaught}</div>
                    </div>
                  )}
                  {report.progress && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Tiến độ bài học</div>
                      <div className="text-sm text-slate-700">{report.progress}</div>
                    </div>
                  )}
                  {report.teacherComment && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Nhận xét chung</div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">{report.teacherComment}</div>
                    </div>
                  )}
                  {report.specialStudents && (
                    <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-200">
                      <div className="text-xs font-semibold text-orange-800 uppercase mb-1 flex items-center gap-1"><AlertCircle size={12}/> Học sinh cần lưu ý</div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">{report.specialStudents}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assistant Report */}
            {report.assistantNote && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Users className="text-teal-500" size={18} />
                  Báo cáo của Trợ giảng
                </h3>
                <div className="bg-teal-50/30 p-3 rounded-lg border border-teal-100">
                  <div className="text-xs font-semibold text-teal-800 uppercase mb-1">Nhận xét của Trợ giảng</div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{report.assistantNote}</div>
                </div>
              </div>
            )}

            {/* Media */}
            {renderMedia()}

            <div className="text-xs text-slate-400 text-right pt-4">
              Nộp lúc: {report.submittedAt ? new Date(report.submittedAt).toLocaleString('vi-VN') : 'Không rõ'}
            </div>
          </div>
      )}
    </Modal>
  );
}
