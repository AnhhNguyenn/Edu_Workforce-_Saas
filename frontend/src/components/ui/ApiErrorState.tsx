import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface ApiErrorStateProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export function ApiErrorState({ 
  onRetry, 
  title = "Hệ thống đang bảo trì", 
  message = "Hiện tại hệ thống không khả dụng hoặc đường truyền mạng không ổn định. Vui lòng thử lại sau ít phút." 
}: ApiErrorStateProps) {
  return (
    <div className="py-16 px-4 text-center border rounded-2xl bg-red-50/50 border-red-100 flex flex-col items-center justify-center my-6">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Thử lại
        </Button>
      )}
    </div>
  );
}
