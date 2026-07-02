import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AttendanceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'checkin' | 'checkout';
  session: any;
  onSubmit: (photoBase64: string | null, reason: string | null) => void;
  isLoading: boolean;
  isOutOfRange?: boolean;
}

export function AttendanceActionModal({ isOpen, onClose, type, session, onSubmit, isLoading, isOutOfRange = false }: AttendanceActionModalProps) {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [managerInformed, setManagerInformed] = useState<string>('no');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Tính toán thời gian
  const now = new Date();
  const startTime = session?.startTime ? new Date(`${session.sessionDate.split('T')[0]}T${session.startTime}`) : now;
  const endTime = session?.endTime ? new Date(`${session.sessionDate.split('T')[0]}T${session.endTime}`) : now;
  
  const isLateCheckin = type === 'checkin' && (now.getTime() - startTime.getTime()) > 5 * 60 * 1000;
  const isEarlyCheckout = type === 'checkout' && (endTime.getTime() - now.getTime()) > 0;
  const isLateCheckout = type === 'checkout' && (now.getTime() - endTime.getTime()) > 5 * 60 * 1000;
  
  const requiresReason = isLateCheckin || isEarlyCheckout || isLateCheckout || isOutOfRange;

  const startCamera = useCallback(async () => {
    try {
      if (stream) return;
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError("Thiết bị này không có camera. Vui lòng sử dụng điện thoại hoặc thiết bị có camera để Check-in.");
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Quyền truy cập bị từ chối. Vui lòng cấp quyền camera trong cài đặt trình duyệt.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError("Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó và thử lại.");
      } else {
        setCameraError(`Lỗi camera: ${err.message || err.name}`);
      }
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen && type === 'checkin') {
      startCamera();
    } else {
      stopCamera();
      // Reset state on close
      setPhotoBase64(null);
      setReason('');
      setManagerInformed('no');
    }
    return () => stopCamera();
  }, [isOpen, type, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Compress image to base64 jpeg
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        setPhotoBase64(base64);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhotoBase64(null);
    startCamera();
  };

    const handleSubmit = () => {
    let finalReason = null;
    if (requiresReason && reason.trim()) {
      const informedText = managerInformed === 'yes' ? '[Đã báo quản lý]' : '[Chưa báo quản lý]';
      const rangeText = isOutOfRange ? '[Ngoài cơ sở]' : '';
      const reasonType = isLateCheckin ? 'Check-in Trễ' : isEarlyCheckout ? 'Check-out Sớm' : isLateCheckout ? 'Check-out Trễ' : 'Giải trình';
      finalReason = `${rangeText} ${informedText} ${reasonType}: ${reason.trim()}`;
    }
    onSubmit(photoBase64, finalReason);
  };

  const isSubmitDisabled = isLoading || (type === 'checkin' && !photoBase64) || (requiresReason && !reason.trim());

  const modalFooter = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Huỷ
      </Button>
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitDisabled}
        className={type === 'checkin' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Xác nhận {type === 'checkin' ? 'Check-in' : 'Check-out'}
      </Button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isLoading && onClose()} 
      title={type === 'checkin' ? 'Check-in Ca Dạy' : 'Check-out Ca Dạy'}
      footer={modalFooter}
    >
      <div className="flex flex-col gap-4 py-2">
        <p className="text-sm text-slate-500 mb-2">
          {type === 'checkin' 
            ? 'Vui lòng chụp ảnh xác nhận (selfie) tại cơ sở để hoàn tất Check-in.' 
            : 'Xác nhận hoàn thành ca dạy và Check-out.'}
        </p>
        
        {/* Camera Section for Check-in */}
        {type === 'checkin' && (
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700">Ảnh xác nhận *</label>
            <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[250px]">
              {photoBase64 ? (
                <img src={photoBase64} alt="Captured" className="w-full h-auto object-cover" />
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}

              {cameraError && !photoBase64 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-red-500 p-4 text-center text-sm font-medium gap-3">
                  <p>{cameraError}</p>
                  <Button 
                    onClick={startCamera} 
                    variant="outline" 
                    className="bg-white border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Bật quyền Camera
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-2">
              {!photoBase64 ? (
                <Button onClick={capturePhoto} disabled={!!cameraError} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 w-12 p-0 flex items-center justify-center">
                  <Camera size={24} />
                </Button>
              ) : (
                <Button onClick={retakePhoto} variant="outline" className="flex items-center gap-2">
                  <RefreshCcw size={16} /> Chụp lại
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Reason Form for Late/Early actions */}
        {requiresReason && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-3">
            <div className="flex items-start gap-2 text-orange-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span className="text-sm font-medium">
                {isOutOfRange && 'Bạn đang ở ngoài phạm vi cơ sở trường học. '}
                {isLateCheckin && 'Bạn đang Check-in trễ hơn 5 phút so với giờ bắt đầu.'}
                {isEarlyCheckout && 'Bạn đang Check-out sớm trước khi kết thúc ca.'}
                {isLateCheckout && 'Bạn đang Check-out trễ (ngoài giờ).'}
              </span>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reason" className="text-orange-900 font-semibold text-sm">Lý do giải trình *</label>
              <Textarea 
                id="reason"
                placeholder="Vui lòng nhập lý do cụ thể..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-white border-orange-200 focus-visible:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-orange-900 font-semibold text-sm">Đã báo cáo với Quản lý cơ sở chưa? *</label>
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="managerInformed" 
                    value="yes" 
                    checked={managerInformed === 'yes'} 
                    onChange={() => setManagerInformed('yes')} 
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-normal text-slate-700">Đã thông báo Quản lý</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="managerInformed" 
                    value="no" 
                    checked={managerInformed === 'no'} 
                    onChange={() => setManagerInformed('no')} 
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-normal text-slate-700">Chưa kịp thông báo</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
