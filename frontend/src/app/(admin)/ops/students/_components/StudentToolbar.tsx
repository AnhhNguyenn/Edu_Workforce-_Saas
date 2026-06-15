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
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" size={18} />
          <Input 
            placeholder="Tìm kiếm tên, mã HV, SĐT..." 
            className="pl-10 bg-white" 
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-white border-edu-border w-full sm:w-auto" onClick={onOpenFilter}>
          <Filter size={18} />
          Lọc
        </Button>
      </div>

      {isAuthorized && (
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          <Button variant="secondary" className="flex-1 sm:flex-none gap-2 bg-white hover:bg-gray-50 border-edu-border border" onClick={onExport} disabled={isExporting || isImporting}>
            <DownloadCloud size={16} className="text-edu-muted shrink-0" />
            <span className="text-sm">{isExporting ? 'Đang xuất...' : 'Xuất File'}</span>
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx" onChange={handleFileChange} />
          <Button variant="secondary" className="flex-1 sm:flex-none gap-2 bg-white hover:bg-gray-50 border-edu-border border" onClick={() => fileInputRef.current?.click()} disabled={isExporting || isImporting}>
            <UploadCloud size={16} className="text-edu-muted shrink-0" />
            <span className="text-sm">{isImporting ? 'Đang nhập...' : 'Nhập File'}</span>
          </Button>
          <div className="w-full sm:w-auto">
            <CreateButton onClick={onOpenCreate} label="Thêm học viên" className="shadow-sm w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
