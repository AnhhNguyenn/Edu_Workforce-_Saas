import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { UploadCloud, File as FileIcon, X, Loader2, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, User, Building, GraduationCap, Settings2, Trash2 } from 'lucide-react';
import { usePreviewImportSession, useConfirmImportSession } from '@/hooks/queries/useSessions';
import { toast } from 'react-hot-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { Switch } from './switch';

interface ImportScheduleModalProps {
  onClose: () => void;
}

export function ImportScheduleModal({ onClose }: ImportScheduleModalProps) {
  const [step, setStep] = useState<'upload' | 'preview_system' | 'preview_sessions'>('upload');
  
  const [files, setFiles] = useState<File[]>([]);
  const [autoCreateUsers, setAutoCreateUsers] = useState(true);
  const [autoCreateSchools, setAutoCreateSchools] = useState(true);
  const [autoCreateClasses, setAutoCreateClasses] = useState(true);
  const [autoCreateCustomFields, setAutoCreateCustomFields] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [editingSession, setEditingSession] = useState<any>(null);

  const handleAddSession = () => {
    const newSession = {
      tempId: Math.random().toString(36).substring(7),
      sessionDate: new Date().toISOString(),
      startTime: "08:00:00",
      endTime: "09:00:00",
      className: "Lớp Mới",
      schoolName: "Cơ sở mặc định",
      teacherName: "",
      assistantNames: [],
      actualStudentCount: 0,
      errors: []
    };
    setPreviewData({
      ...previewData,
      sessions: [newSession, ...previewData.sessions]
    });
    setEditingSession(newSession);
  };

  const handleSaveEditSession = () => {
    if (!editingSession) return;
    const newData = { ...previewData };
    const idx = newData.sessions.findIndex((s: any) => s.tempId === editingSession.tempId);
    if (idx !== -1) {
      newData.sessions[idx] = editingSession;
      setPreviewData(newData);
    }
    setEditingSession(null);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eduOps_importScheduleConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.autoCreateUsers !== undefined) setAutoCreateUsers(parsed.autoCreateUsers);
        if (parsed.autoCreateSchools !== undefined) setAutoCreateSchools(parsed.autoCreateSchools);
        if (parsed.autoCreateClasses !== undefined) setAutoCreateClasses(parsed.autoCreateClasses);
        if (parsed.autoCreateCustomFields !== undefined) setAutoCreateCustomFields(parsed.autoCreateCustomFields);
      }
    } catch (e) { }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('eduOps_importScheduleConfig', JSON.stringify({
        autoCreateUsers,
        autoCreateSchools,
        autoCreateClasses,
        autoCreateCustomFields
      }));
    } catch (e) { }
  }, [autoCreateUsers, autoCreateSchools, autoCreateClasses, autoCreateCustomFields, isLoaded]);
  
  const previewMutation = usePreviewImportSession();
  const confirmMutation = useConfirmImportSession();

  const [previewData, setPreviewData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
      if (selectedFiles.length > 0) {
        setFiles(prev => [...prev, ...selectedFiles]);
      } else {
        toast.error('Vui lòng chọn file Excel hợp lệ (.xlsx, .xls)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
      if (selectedFiles.length > 0) {
        setFiles(prev => [...prev, ...selectedFiles]);
      } else {
        toast.error('Vui lòng chọn file Excel hợp lệ (.xlsx, .xls)');
      }
    }
  };

  const handlePreview = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một file Excel');
      return;
    }

    try {
      const data = await previewMutation.mutateAsync({
        files: files,
        autoCreateSchools,
        autoCreateClasses,
        autoCreateUsers,
        autoCreateCustomFields
      });
      setPreviewData(data);
      setStep('preview_system');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi phân tích file');
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(previewData);
      toast.success('Nhập dữ liệu thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  const removeItem = (listName: string, tempId: string) => {
    setPreviewData((prev: any) => ({
      ...prev,
      [listName]: prev[listName].filter((item: any) => item.tempId !== tempId)
    }));
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="bg-edu-accentLight/50 border border-edu-accentLight text-edu-accent p-4 rounded-xl text-sm flex gap-3 shadow-sm">
        <AlertCircle className="shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-bold mb-1">Hướng dẫn nhập file (Phiên bản mới):</p>
          <ul className="list-disc pl-4 space-y-1.5 text-edu-fg/80">
            <li>File phải có định dạng Excel (.xlsx).</li>
            <li>Sau khi tải lên, hệ thống sẽ <b>phân tích và hiển thị bản nháp</b> trước khi lưu.</li>
            <li>Bạn có thể kiểm tra danh sách Tài khoản, Lớp, Cơ sở tự động tạo.</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white border border-edu-border rounded-xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-edu-fg mb-1">Tuỳ chọn đồng bộ dữ liệu</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="autoCreateUsers" className="text-sm font-medium text-edu-muted cursor-pointer select-none">
              Tự động khởi tạo tài khoản Giáo viên / Trợ giảng
            </label>
            <Switch checked={autoCreateUsers} onCheckedChange={setAutoCreateUsers} id="autoCreateUsers" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="autoCreateSchools" className="text-sm font-medium text-edu-muted cursor-pointer select-none">
              Tự động khởi tạo Cơ sở (Theo tên Sheet)
            </label>
            <Switch checked={autoCreateSchools} onCheckedChange={setAutoCreateSchools} id="autoCreateSchools" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="autoCreateClasses" className="text-sm font-medium text-edu-muted cursor-pointer select-none">
              Tự động khởi tạo Lớp học mới
            </label>
            <Switch checked={autoCreateClasses} onCheckedChange={setAutoCreateClasses} id="autoCreateClasses" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="autoCreateCustomFields" className="text-sm font-medium text-edu-muted cursor-pointer select-none">
              Khởi tạo Custom Fields từ các cột lạ
            </label>
            <Switch checked={autoCreateCustomFields} onCheckedChange={setAutoCreateCustomFields} id="autoCreateCustomFields" />
          </div>
        </div>
      </div>

      <div 
        className={`transition-all ${
          files.length > 0 
            ? 'flex flex-col gap-3' 
            : 'border-2 border-dashed border-edu-border hover:border-edu-accent hover:bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer'
        }`}
        onClick={() => files.length === 0 && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange}
          multiple
        />

        {files.length > 0 ? (
          <>
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-edu-accent w-full bg-edu-accentLight/20 relative overflow-hidden">
                <div className="w-12 h-12 bg-white text-edu-accent rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-edu-accentLight">
                  <FileIcon size={24} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-edu-fg truncate">{f.name}</p>
                  <p className="text-xs text-edu-muted mt-0.5">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setFiles(prev => prev.filter((_, idx) => idx !== i));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-2 text-edu-muted hover:text-edu-danger hover:bg-edu-dangerLight rounded-full transition-colors absolute right-4"
                  title="Xóa file"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="mt-2"
            >
              <UploadCloud size={16} className="mr-2" />
              Thêm file khác
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-edu-accentLight/50 text-edu-accent rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={32} />
            </div>
            <h3 className="font-bold text-edu-fg mb-1">Click hoặc kéo thả file Excel vào đây</h3>
            <p className="text-sm text-edu-muted">Hỗ trợ chọn nhiều file (.xlsx, .xls)</p>
          </>
        )}
      </div>
    </div>
  );

  const renderPreviewSystemStep = () => {
    if (!previewData) return null;
    return (
      <div className="space-y-6">
        <div className="bg-edu-warnLight/50 border border-edu-warnLight text-edu-warn p-4 rounded-xl text-sm shadow-sm flex gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold mb-1">Kiểm tra dữ liệu Hệ thống (Chưa lưu vào Database)</p>
            <p className="text-edu-fg/80">Dưới đây là các tài khoản, cơ sở, lớp học sẽ được hệ thống tạo mới. Bạn có thể xóa nếu không muốn tạo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-edu-border rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-50 border-b border-edu-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-edu-fg text-sm">
                <User size={16} className="text-edu-accent" /> Tài khoản Mới ({previewData.usersToCreate.length})
              </div>
            </div>
            <div className="p-0 max-h-[300px] overflow-y-auto">
              {previewData.usersToCreate.length === 0 ? (
                <div className="p-6 text-center text-edu-muted text-sm">Không có tài khoản mới</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên/Email</TableHead>
                      <TableHead>Mật khẩu</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.usersToCreate.map((u: any) => (
                      <TableRow key={u.tempId}>
                        <TableCell>
                          <div className="font-bold text-edu-fg">{u.fullName}</div>
                          <div className="text-xs text-edu-muted">{u.email}</div>
                          <Badge variant={u.roleCode === 'TEACHER' ? 'info' : 'success'} className="mt-1 text-[10px]">
                            {u.roleCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-edu-muted">{u.defaultPassword}</TableCell>
                        <TableCell className="text-right">
                          <button onClick={() => removeItem('usersToCreate', u.tempId)} className="text-edu-muted hover:text-edu-danger p-1.5 hover:bg-edu-dangerLight rounded-md transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-edu-border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-50 border-b border-edu-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-edu-fg text-sm">
                  <Building size={16} className="text-edu-warn" /> Cơ sở Mới ({previewData.schoolsToCreate.length})
                </div>
              </div>
              <div className="p-0 max-h-[140px] overflow-y-auto">
                {previewData.schoolsToCreate.length === 0 ? (
                  <div className="p-4 text-center text-edu-muted text-sm">Không có cơ sở mới</div>
                ) : (
                  <ul className="divide-y divide-edu-border">
                    {previewData.schoolsToCreate.map((s: any) => (
                      <li key={s.tempId} className="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50">
                        <span className="text-sm font-bold text-edu-fg">{s.name}</span>
                        <button onClick={() => removeItem('schoolsToCreate', s.tempId)} className="text-edu-muted hover:text-edu-danger p-1.5 hover:bg-edu-dangerLight rounded-md"><Trash2 size={14}/></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="border border-edu-border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-50 border-b border-edu-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-edu-fg text-sm">
                  <GraduationCap size={16} className="text-purple-500" /> Lớp học Mới ({previewData.classesToCreate.length})
                </div>
              </div>
              <div className="p-0 max-h-[140px] overflow-y-auto">
                {previewData.classesToCreate.length === 0 ? (
                  <div className="p-4 text-center text-edu-muted text-sm">Không có lớp mới</div>
                ) : (
                  <ul className="divide-y divide-edu-border">
                    {previewData.classesToCreate.map((c: any) => (
                      <li key={c.tempId} className="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <div className="text-sm font-bold text-edu-fg">{c.name}</div>
                          <div className="text-xs text-edu-muted">Thuộc: {c.schoolName}</div>
                        </div>
                        <button onClick={() => removeItem('classesToCreate', c.tempId)} className="text-edu-muted hover:text-edu-danger p-1.5 hover:bg-edu-dangerLight rounded-md"><Trash2 size={14}/></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewSessionsStep = () => {
    if (!previewData) return null;
    return (
      <div className="space-y-4">
        <div className="bg-edu-accentLight/50 border border-edu-accentLight text-edu-accent p-4 rounded-xl text-sm shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="shrink-0" size={24} />
            <div>
              <p className="font-bold text-lg">Sẵn sàng khởi tạo {previewData.sessions.length} Ca học</p>
              <p className="text-edu-fg/80">Vui lòng rà soát danh sách dưới đây trước khi bấm Lưu vào hệ thống.</p>
            </div>
          </div>
          <Button onClick={handleAddSession} className="bg-white text-edu-accent hover:bg-slate-50 border border-edu-accentLight gap-2">
            Thêm Ca học
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Lớp học</TableHead>
                <TableHead>Cơ sở</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Trợ giảng</TableHead>
                <TableHead>Sĩ số</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.sessions.map((s: any) => (
                <TableRow key={s.tempId}>
                  <TableCell className="font-medium text-edu-fg">{new Date(s.sessionDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="font-bold text-edu-muted">{s.startTime.substring(0,5)} - {s.endTime.substring(0,5)}</TableCell>
                  <TableCell className="font-bold text-edu-accent">{s.className}</TableCell>
                  <TableCell className="text-edu-muted">{s.schoolName}</TableCell>
                  <TableCell className="font-medium">{s.teacherName || <span className="text-edu-muted font-normal italic">Trống</span>}</TableCell>
                  <TableCell>{s.assistantNames?.length > 0 ? s.assistantNames.join(', ') : <span className="text-edu-muted italic">Trống</span>}</TableCell>
                  <TableCell className="text-center">{s.actualStudentCount ?? '-'}</TableCell>
                  <TableCell>
                    {s.errors && s.errors.length > 0 ? (
                      <Badge variant="danger" className="flex gap-1 items-center px-1.5 py-0.5">
                        <AlertCircle size={12}/> Lỗi
                      </Badge>
                    ) : <Badge variant="success">Hợp lệ</Badge>}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <button onClick={() => setEditingSession(s)} className="text-edu-muted hover:text-edu-accent p-1.5 hover:bg-edu-accentLight/50 rounded-md transition-colors" title="Sửa ca học">
                      <Settings2 size={14} />
                    </button>
                    <button onClick={() => removeItem('sessions', s.tempId)} className="text-edu-muted hover:text-edu-danger p-1.5 hover:bg-edu-dangerLight rounded-md transition-colors" title="Xóa ca học">
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {previewData.sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-edu-muted">
                    Không có ca học nào được tìm thấy hoặc đã bị xóa hết.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {editingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-[500px] overflow-hidden">
              <div className="px-6 py-4 border-b border-edu-border font-bold text-lg flex justify-between items-center">
                Chỉnh sửa Ca học
                <button onClick={() => setEditingSession(null)} className="text-edu-muted hover:text-edu-fg"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày học</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.sessionDate ? new Date(editingSession.sessionDate).toISOString().split('T')[0] : ''} onChange={e => setEditingSession({...editingSession, sessionDate: new Date(e.target.value).toISOString()})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Từ giờ</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.startTime?.substring(0,5)} onChange={e => setEditingSession({...editingSession, startTime: e.target.value + ":00"})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Đến</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.endTime?.substring(0,5)} onChange={e => setEditingSession({...editingSession, endTime: e.target.value + ":00"})} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lớp học</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.className || ''} onChange={e => setEditingSession({...editingSession, className: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cơ sở</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.schoolName || ''} onChange={e => setEditingSession({...editingSession, schoolName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Giáo viên</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.teacherName || ''} onChange={e => setEditingSession({...editingSession, teacherName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sĩ số</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.actualStudentCount || 0} onChange={e => setEditingSession({...editingSession, actualStudentCount: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trợ giảng (Cách nhau bởi dấu phẩy)</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSession.assistantNames ? editingSession.assistantNames.join(', ') : ''} onChange={e => setEditingSession({...editingSession, assistantNames: e.target.value.split(',').map((s: string)=>s.trim()).filter((s: string)=>s)})} />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingSession(null)}>Hủy</Button>
                <Button onClick={handleSaveEditSession} className="bg-edu-accent text-white hover:bg-edu-accent/90">Lưu thay đổi</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  const getModalWidth = () => {
    if (step === 'upload') return 'max-w-2xl';
    if (step === 'preview_system') return 'max-w-5xl';
    return 'max-w-[90vw]';
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        step === 'upload' ? "Phân tích & Nhập lịch học từ Excel" : 
        step === 'preview_system' ? "Bước 1/2: Kiểm tra Dữ liệu Khởi tạo" : 
        "Bước 2/2: Xác nhận Danh sách Ca học"
      }
      className={getModalWidth()}
      footer={
        <div className="flex justify-between w-full items-center">
          <div>
            {step === 'preview_sessions' && (
              <Button variant="outline" onClick={() => setStep('preview_system')} className="gap-2 text-edu-muted">
                <ArrowLeft size={16} /> Quay lại
              </Button>
            )}
            {step === 'preview_system' && (
              <Button variant="outline" onClick={() => { setPreviewData(null); setStep('upload'); }} className="gap-2 text-edu-muted">
                <ArrowLeft size={16} /> Chọn file khác
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={previewMutation.isPending || confirmMutation.isPending}>Hủy</Button>
            
            {step === 'upload' && (
              <Button 
                onClick={handlePreview} 
                disabled={files.length === 0 || previewMutation.isPending}
                className="bg-edu-accent hover:bg-edu-accent/90 text-white gap-2 px-6"
              >
                {previewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Settings2 size={16} />}
                Phân tích File
              </Button>
            )}

            {step === 'preview_system' && (
              <Button 
                onClick={() => setStep('preview_sessions')} 
                className="bg-edu-accent hover:bg-edu-accent/90 text-white gap-2 px-6"
              >
                Tiếp tục <ArrowRight size={16} />
              </Button>
            )}

            {step === 'preview_sessions' && (
              <Button 
                onClick={handleConfirm} 
                disabled={confirmMutation.isPending || !previewData || previewData.sessions.length === 0}
                className="bg-edu-success hover:bg-edu-success/90 text-white gap-2 px-6 shadow-md shadow-edu-success/20"
              >
                {confirmMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Xác nhận Nhập ({previewData?.sessions?.length || 0})
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="transition-all duration-300">
        {step === 'upload' && renderUploadStep()}
        {step === 'preview_system' && renderPreviewSystemStep()}
        {step === 'preview_sessions' && renderPreviewSessionsStep()}
      </div>
    </Modal>
  );
}
