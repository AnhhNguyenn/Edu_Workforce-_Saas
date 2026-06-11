import { useRef } from 'react';
import { Search, Filter, DownloadCloud, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateButton } from '@/components/ui/create-button';
import { Input } from '@/components/ui/input';

interface StudentToolbarProps {
  onExport: () => void;
  isExporting: boolean;
  onImport: (file: File) => void;
  isImporting: boolean;
  onSearch: (val: string) => void;
  searchKeyword: string;
  onOpenCreate: () => void;
  onOpenFilter: () => void;
  isAuthorized: boolean;
}

export function StudentToolbar({ onExport, isExporting, onImport, isImporting, onSearch, searchKeyword, onOpenCreate, onOpenFilter, isAuthorized }: StudentToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={18} />
          <Input 
            placeholder="Tìm kiếm tên, mã HV, SĐT..." 
            className="pl-10 bg-white" 
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-white border-edu-border" onClick={onOpenFilter}>
          <Filter size={18} />
          Lọc
        </Button>
      </div>

      {isAuthorized && (
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" className="gap-2 bg-white hover:bg-gray-50 border-edu-border border" onClick={onExport} disabled={isExporting || isImporting}>
            <DownloadCloud size={18} className="text-edu-muted" />
            {isExporting ? 'Đang xuất...' : 'Xuất File'}
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx" onChange={handleFileChange} />
          <Button variant="secondary" className="gap-2 bg-white hover:bg-gray-50 border-edu-border border" onClick={() => fileInputRef.current?.click()} disabled={isExporting || isImporting}>
            <UploadCloud size={18} className="text-edu-muted" />
            {isImporting ? 'Đang nhập...' : 'Nhập File'}
          </Button>
          <CreateButton onClick={onOpenCreate} label="Thêm Học Viên" className="shadow-sm" />
        </div>
      )}
    </div>
  );
}
