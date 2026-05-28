"use client";
import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";

export default function CheckinPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  return (
    <div className="space-y-6 pt-4 flex flex-col min-h-full">
      {/* GPS Status */}
      <div className="bg-edu-successLight text-edu-success px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
        <CheckCircle2 size={18} />
        <span>GPS hợp lệ — THCS Hoàng Diệu (128m)</span>
      </div>

      {/* Main Action Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="text-sm text-edu-muted font-medium mb-2">Lớp 8/2 — 07:30</div>
        <div className="text-5xl font-extrabold text-edu-fg mb-4 tabular-nums tracking-tight">07:22</div>
        
        <div className="bg-edu-successLight/50 text-edu-success px-3 py-1 rounded-md text-xs font-bold mb-10 flex items-center gap-1.5">
          <CheckCircle2 size={14} />
          <span>On time — Sớm 8 phút</span>
        </div>

        <button 
          onClick={() => setIsCheckedIn(true)}
          disabled={isCheckedIn}
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-[0.98] \${
            isCheckedIn 
              ? 'bg-gray-300 opacity-60 cursor-not-allowed transform-none' 
              : 'bg-gradient-to-r from-[#FF8A65] to-[#FFB74D] shadow-lg shadow-[#FF8A65]/30 hover:-translate-y-0.5'
          }`}
        >
          {isCheckedIn ? 'Đã Check-out ✓' : 'CHECK-OUT'}
        </button>
      </div>

      {/* History Area */}
      <div className="mt-auto">
        <h3 className="font-bold text-edu-fg text-sm mb-3">Lịch sử hôm nay</h3>
        <div className="bg-edu-successLight rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-edu-success text-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-edu-fg">Check-in: 07:22</div>
            <div className="text-[0.7rem] text-edu-muted font-medium">On time · GPS OK</div>
          </div>
        </div>
      </div>
    </div>
  );
}

