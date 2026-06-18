import React, { useState } from 'react';
import { X, Calendar, Download, Building2, GraduationCap, User, Loader2, FileSpreadsheet } from 'lucide-react';
import { useClasses } from '@/hooks/queries/useClasses';
import { useSchools } from '@/hooks/queries/useSchools';
import { useUsers } from '@/hooks/queries/useUsers';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface ExportScheduleModalProps {
  onClose: () => void;
}

export const ExportScheduleModal: React.FC<ExportScheduleModalProps> = ({ onClose }) => {
  const [exportMode, setExportMode] = useState<'day' | 'week' | 'month' | 'year' | 'dynamic'>('month');
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString('en-CA'));
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [endDate, setEndDate] = useState(new Date().toLocaleDateString('en-CA'));
  
  const [schoolId, setSchoolId] = useState<string>('all');
  const [classId, setClassId] = useState<string>('all');
  const [teacherId, setTeacherId] = useState<string>('all');
  
  const [outputFormat, setOutputFormat] = useState<'single' | 'multiple'>('single');
  const [isExporting, setIsExporting] = useState(false);

  const { data: schools } = useSchools();
  const { data: classes } = useClasses(undefined, schoolId !== 'all' ? schoolId : undefined);
  const { data: teachers } = useUsers('TEACHER');

  const getCalculatedDateRange = () => {
    let start = new Date(dateStr);
    let end = new Date(dateStr);

    if (exportMode === 'day') {
      // already set
    } else if (exportMode === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    } else if (exportMode === 'month') {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (exportMode === 'year') {
      start = new Date(start.getFullYear(), 0, 1);
      end = new Date(start.getFullYear(), 11, 31);
    } else if (exportMode === 'dynamic') {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    return { 
      startDate: start.toLocaleDateString('en-CA'), 
      endDate: end.toLocaleDateString('en-CA') 
    };
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const { startDate: sDate, endDate: eDate } = getCalculatedDateRange();

      // Dynamic imports to avoid SSR issues and keep bundle size small if not used
      const XLSX = await import('xlsx');
      
      const queryParams = new URLSearchParams({
        startDate: sDate,
        endDate: eDate,
        pageSize: '10000', // Fetch practically all sessions in the range
      });

      if (schoolId !== 'all') queryParams.append('schoolId', schoolId);
      if (classId !== 'all') queryParams.append('classId', classId);
      if (teacherId !== 'all') queryParams.append('teacherId', teacherId);

      const response = await apiClient.get(`/sessions?${queryParams.toString()}`);
      const sessions = response.data?.items || [];

      if (sessions.length === 0) {
        toast.error('Không có dữ liệu lịch học nào trong khoảng thời gian này để xuất!');
        return;
      }

      // Enrich data
      const enrichedSessions = sessions.map((s: any) => {
        const cInfo = classes?.items?.find((c: any) => c.id === s.classId);
        const className = cInfo?.name || s.classId?.substring(0, 8);
        const schId = (cInfo as any)?.schoolId || s.schoolId;
        const schoolName = schools?.items?.find((sch: any) => sch.id === schId)?.name || 'Chưa xếp cơ sở';
        const tName = teachers?.items?.find((t: any) => t.id === s.teacherId)?.fullName || 'Chưa xếp';
        
        return {
          ...s,
          className,
          schoolName,
          teacherName: tName,
        };
      });

      // Format data for excel
      const formatDataForSheet = (data: any[]) => {
        return data.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()).map(s => ({
          'Ngày': new Date(s.sessionDate).toLocaleDateString('vi-VN'),
          'Giờ bắt đầu': s.startTime.substring(0, 5),
          'Giờ kết thúc': s.endTime.substring(0, 5),
          'Cơ sở': s.schoolName,
          'Lớp': s.className,
          'Bài học': s.lessonTitle || 'Lý thuyết',
          'Phòng': s.roomName || 'Chưa xếp phòng',
          'Giáo viên': s.teacherName,
          'Trợ giảng': s.assistantName || 'Chưa xếp',
          'Trạng thái': s.statusCode === 'COMPLETED' ? 'Đã hoàn thành' : (s.statusCode === 'CANCELLED' ? 'Đã hủy' : 'Đã lên lịch'),
          'Ghi chú': s.notes || ''
        }));
      };

      if (outputFormat === 'single') {
        const wb = XLSX.utils.book_new();
        
        // Group by teacher
        const groupedByTeacher: Record<string, any[]> = {};
        enrichedSessions.forEach((s: any) => {
          const key = s.teacherName;
          if (!groupedByTeacher[key]) groupedByTeacher[key] = [];
          groupedByTeacher[key].push(s);
        });

        Object.entries(groupedByTeacher).forEach(([tName, tSessions]) => {
          const sheetData = formatDataForSheet(tSessions);
          const ws = XLSX.utils.json_to_sheet(sheetData);
          
          // Auto-size columns
          const colWidths = [
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, 
            { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
          ];
          ws['!cols'] = colWidths;
          
          // Sheet names must be <= 31 chars
          let safeSheetName = tName.replace(/[\\/*?:[\]]/g, "").substring(0, 31);
          if (!safeSheetName || safeSheetName.toLowerCase() === 'chưa xếp') safeSheetName = "Chưa xếp GV";
          
          // Ensure unique sheet names
          if (wb.SheetNames.includes(safeSheetName)) {
            safeSheetName = safeSheetName.substring(0, 27) + "..." + Math.floor(Math.random()*10);
          }
          
          XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
        });

        XLSX.writeFile(wb, `Lich_Hoc_${sDate}_${eDate}.xlsx`);
        toast.success('Xuất file Excel thành công!');

      } else {
        // Multiple files -> ZIP
        const JSZip = (await import('jszip')).default;
        const { saveAs } = await import('file-saver');
        
        const zip = new JSZip();
        
        const groupedByTeacher: Record<string, any[]> = {};
        enrichedSessions.forEach((s: any) => {
          const key = s.teacherName;
          if (!groupedByTeacher[key]) groupedByTeacher[key] = [];
          groupedByTeacher[key].push(s);
        });

        Object.entries(groupedByTeacher).forEach(([tName, tSessions]) => {
          const wb = XLSX.utils.book_new();
          const sheetData = formatDataForSheet(tSessions);
          const ws = XLSX.utils.json_to_sheet(sheetData);
          
          const colWidths = [
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, 
            { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
          ];
          ws['!cols'] = colWidths;
          XLSX.utils.book_append_sheet(wb, ws, "Lịch Học");
          
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          
          let safeFileName = tName.replace(/[\\/*?:[\]]/g, "_");
          zip.file(`Lich_Hoc_${safeFileName}.xlsx`, excelBuffer);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `Lich_Hoc_Nhom_${sDate}_${eDate}.zip`);
        toast.success('Xuất file ZIP thành công!');
      }
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <h2 className="text-lg font-bold">Xuất Lịch Học (Excel)</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> Khoảng thời gian</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto hide-scrollbar">
              {[
                { id: 'day', label: 'Ngày' },
                { id: 'week', label: 'Tuần' },
                { id: 'month', label: 'Tháng' },
                { id: 'year', label: 'Năm' },
                { id: 'dynamic', label: 'Tùy chỉnh' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setExportMode(mode.id as any)}
                  className={`flex-1 py-1.5 px-3 text-[13px] font-bold rounded-lg transition-all whitespace-nowrap ${exportMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {exportMode === 'dynamic' ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  <span className="text-[12px] font-medium text-slate-500">Từ ngày</span>
                  <DatePicker 
                    selected={new Date(startDate)} 
                    onChange={date => date && setStartDate(date.toLocaleDateString('en-CA'))} 
                    className="border-slate-200 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-[12px] font-medium text-slate-500">Đến ngày</span>
                  <DatePicker 
                    selected={new Date(endDate)} 
                    onChange={date => date && setEndDate(date.toLocaleDateString('en-CA'))} 
                    className="border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <DatePicker 
                selected={new Date(dateStr)} 
                onChange={date => date && setDateStr(date.toLocaleDateString('en-CA'))} 
                dateFormat={exportMode === 'year' ? 'yyyy' : exportMode === 'month' ? 'MM/yyyy' : 'dd/MM/yyyy'}
                showYearPicker={exportMode === 'year'}
                showMonthYearPicker={exportMode === 'month'}
                className="border-slate-200 focus:border-blue-500"
              />
            )}
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Building2 size={14} className="text-indigo-500" /> Cơ sở</label>
              <Select 
                value={schoolId} 
                onChange={val => setSchoolId(val)} 
                options={[
                  { value: 'all', label: 'Tất cả cơ sở' },
                  ...(schools?.items?.map((s: any) => ({ value: s.id, label: s.name })) || [])
                ]}
                className="bg-white border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><GraduationCap size={14} className="text-orange-500" /> Lớp học</label>
              <Select 
                value={classId} 
                onChange={val => setClassId(val)} 
                options={[
                  { value: 'all', label: `Tất cả lớp học ${schoolId !== 'all' ? 'thuộc cơ sở này' : ''}` },
                  ...(classes?.items?.map((c: any) => ({ value: c.id, label: c.name })) || [])
                ]}
                className="bg-white border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><User size={14} className="text-rose-500" /> Giáo viên</label>
              <Select 
                value={teacherId} 
                onChange={val => setTeacherId(val)} 
                options={[
                  { value: 'all', label: 'Tất cả giáo viên' },
                  ...(teachers?.items?.map((t: any) => ({ value: t.id, label: t.fullName })) || [])
                ]}
                className="bg-white border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Export Output Format */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Định dạng xuất</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setOutputFormat('single')}
                className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${outputFormat === 'single' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200 text-slate-500'}`}
              >
                <FileSpreadsheet size={24} className={outputFormat === 'single' ? 'text-emerald-500' : 'text-slate-400'} />
                <span className="font-bold text-sm text-center leading-tight">Chung 1 file Excel<br/><span className="text-[10px] font-medium opacity-80">(Mỗi GV 1 Sheet)</span></span>
              </div>
              <div 
                onClick={() => setOutputFormat('multiple')}
                className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${outputFormat === 'multiple' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:border-blue-200 text-slate-500'}`}
              >
                <div className="relative">
                  <FileSpreadsheet size={24} className={`absolute -left-2 -top-1 opacity-50 ${outputFormat === 'multiple' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <FileSpreadsheet size={24} className={`relative z-10 ${outputFormat === 'multiple' ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
                <span className="font-bold text-sm text-center leading-tight">Nhiều file (ZIP)<br/><span className="text-[10px] font-medium opacity-80">(Mỗi GV 1 File riêng)</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200/50 transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all shadow-sm disabled:opacity-70"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Xuất Excel
          </button>
        </div>
      </div>
    </div>
  );
};
