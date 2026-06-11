import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilter?: () => void;
  hasFilter?: boolean;
}

export function EmptyState({ 
  title = "Không tìm thấy dữ liệu", 
  description = "Không có kết quả nào phù hợp với tìm kiếm hoặc bộ lọc của bạn.",
  onClearFilter,
  hasFilter = false
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-edu-border rounded-2xl bg-gray-50/50">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-edu-border">
        <FolderOpen size={32} className="text-edu-muted opacity-50" />
      </div>
      <h3 className="text-lg font-semibold text-edu-fg mb-2">{title}</h3>
      <p className="text-sm text-edu-muted mb-6 max-w-sm">
        {description}
      </p>
      {hasFilter && onClearFilter && (
        <Button 
          variant="outline" 
          onClick={onClearFilter}
          className="bg-white hover:bg-gray-50 text-edu-fg font-medium"
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
