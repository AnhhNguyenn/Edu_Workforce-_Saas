'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, Bot, DollarSign } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/queries/useProfile";
import { useMySubscription } from "@/hooks/queries/useSubscriptions";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || '';
  const { data: profile } = useProfile();
  const { data: sub } = useMySubscription();

  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiApiKey, setAiApiKey] = useState("");

  const [mimoPriceHit, setMimoPriceHit] = useState("0.0028");
  const [mimoPriceMiss, setMimoPriceMiss] = useState("0.14");
  const [mimoPriceOut, setMimoPriceOut] = useState("0.28");

  const [openAiPriceHit, setOpenAiPriceHit] = useState("0.15");
  const [openAiPriceMiss, setOpenAiPriceMiss] = useState("0.15");
  const [openAiPriceOut, setOpenAiPriceOut] = useState("0.60");

  const [zhipuPriceHit, setZhipuPriceHit] = useState("0.10");
  const [zhipuPriceMiss, setZhipuPriceMiss] = useState("0.10");
  const [zhipuPriceOut, setZhipuPriceOut] = useState("0.10");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // SuperAdmin endpoint to get all settings
        const res = await apiClient.get('/SystemSettings');
        const settings = res.data;
        const baseUrlSetting = settings.find((s: any) => s.settingKey === "AI_BASE_URL");
        const modelSetting = settings.find((s: any) => s.settingKey === "AI_MODEL");
        const keySetting = settings.find((s: any) => s.settingKey === "AI_API_KEY");
        
        const mHit = settings.find((s: any) => s.settingKey === "MIMO_PRICE_INPUT_CACHE_HIT");
        const mMiss = settings.find((s: any) => s.settingKey === "MIMO_PRICE_INPUT_CACHE_MISS");
        const mOut = settings.find((s: any) => s.settingKey === "MIMO_PRICE_OUTPUT");

        const oHit = settings.find((s: any) => s.settingKey === "OPENAI_PRICE_INPUT_CACHE_HIT");
        const oMiss = settings.find((s: any) => s.settingKey === "OPENAI_PRICE_INPUT_CACHE_MISS");
        const oOut = settings.find((s: any) => s.settingKey === "OPENAI_PRICE_OUTPUT");
        
        const zHit = settings.find((s: any) => s.settingKey === "ZHIPU_PRICE_INPUT_CACHE_HIT");
        const zMiss = settings.find((s: any) => s.settingKey === "ZHIPU_PRICE_INPUT_CACHE_MISS");
        const zOut = settings.find((s: any) => s.settingKey === "ZHIPU_PRICE_OUTPUT");
        
        if (baseUrlSetting) setAiBaseUrl(baseUrlSetting.settingValue);
        if (modelSetting) setAiModel(modelSetting.settingValue);
        if (keySetting) setAiApiKey(keySetting.settingValue);
        
        if (mHit) setMimoPriceHit(mHit.settingValue);
        if (mMiss) setMimoPriceMiss(mMiss.settingValue);
        if (mOut) setMimoPriceOut(mOut.settingValue);
        
        if (oHit) setOpenAiPriceHit(oHit.settingValue);
        if (oMiss) setOpenAiPriceMiss(oMiss.settingValue);
        if (oOut) setOpenAiPriceOut(oOut.settingValue);

        if (zHit) setZhipuPriceHit(zHit.settingValue);
        if (zMiss) setZhipuPriceMiss(zMiss.settingValue);
        if (zOut) setZhipuPriceOut(zOut.settingValue);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveAiSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await Promise.all([
        apiClient.put('/SystemSettings/AI_BASE_URL', { settingValue: aiBaseUrl }),
        apiClient.put('/SystemSettings/AI_MODEL', { settingValue: aiModel }),
        apiClient.put('/SystemSettings/AI_API_KEY', { settingValue: aiApiKey }),
        apiClient.put('/SystemSettings/MIMO_PRICE_INPUT_CACHE_HIT', { settingValue: mimoPriceHit }),
        apiClient.put('/SystemSettings/MIMO_PRICE_INPUT_CACHE_MISS', { settingValue: mimoPriceMiss }),
        apiClient.put('/SystemSettings/MIMO_PRICE_OUTPUT', { settingValue: mimoPriceOut }),
        apiClient.put('/SystemSettings/OPENAI_PRICE_INPUT_CACHE_HIT', { settingValue: openAiPriceHit }),
        apiClient.put('/SystemSettings/OPENAI_PRICE_INPUT_CACHE_MISS', { settingValue: openAiPriceMiss }),
        apiClient.put('/SystemSettings/OPENAI_PRICE_OUTPUT', { settingValue: openAiPriceOut }),
        apiClient.put('/SystemSettings/ZHIPU_PRICE_INPUT_CACHE_HIT', { settingValue: zhipuPriceHit }),
        apiClient.put('/SystemSettings/ZHIPU_PRICE_INPUT_CACHE_MISS', { settingValue: zhipuPriceMiss }),
        apiClient.put('/SystemSettings/ZHIPU_PRICE_OUTPUT', { settingValue: zhipuPriceOut })
      ]);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="w-full space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-edu-fg">Cài đặt trung tâm</h2>
          <p className="text-edu-muted text-sm">Quản lý thông tin chung và cấu hình hệ thống tại EduCenter Sài Gòn</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-6 border-b border-edu-border">
          <h3 className="text-lg font-bold text-edu-fg mb-4">Thông tin cơ bản</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="font-medium text-sm text-edu-fgSecondary">Tên trung tâm</label>
              <div className="col-span-2">
                <Input readOnly value={profile?.organizationName || ""} className="bg-gray-50 focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
              </div>
            </div>
            {profile?.customAppName && (
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-medium text-sm text-edu-fgSecondary">Tên ứng dụng</label>
                <div className="col-span-2">
                  <Input readOnly value={profile.customAppName} className="bg-gray-50 focus:border-[#4CAF50] focus:ring-[#4CAF50]/30" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 items-center gap-4 pt-4 border-t border-edu-border">
              <label className="font-medium text-sm text-edu-fgSecondary">Gói hiện tại</label>
              <div className="col-span-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-edu-accent">{sub?.planName || "Đang tải..."}</span>
                  {sub?.subscriptionEnd && (
                    <span className="text-xs text-edu-muted ml-2">
                      (Hết hạn: {new Date(sub.subscriptionEnd).toLocaleDateString('vi-VN')})
                    </span>
                  )}
                </div>
                <Button variant="secondary" size="sm">Nâng cấp</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userRole === 'SUPER_ADMIN' && (
        <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
          <div className="p-6 border-b border-edu-border flex items-center gap-3 bg-gradient-to-r from-purple-50 to-white">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900">Cấu hình AI & Token Pricing</h3>
              <p className="text-sm text-purple-600/80">Quản lý kết nối LLM và định mức giá Token (Chỉ dành cho SuperAdmin)</p>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-edu-muted">
                <Loader2 className="animate-spin mr-2" size={20} /> Đang tải cấu hình AI...
              </div>
            ) : (
              <div className="space-y-8">
                {/* Thông số kết nối API */}
                <div>
                  <h4 className="font-semibold text-edu-fg mb-4 flex items-center gap-2"><Bot size={16} className="text-edu-muted"/> API Connection</h4>
                  <div className="space-y-4 max-w-2xl bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="font-medium text-sm text-edu-fgSecondary">Base URL</label>
                      <div className="col-span-2">
                        <Input 
                          value={aiBaseUrl} 
                          onChange={e => setAiBaseUrl(e.target.value)} 
                          placeholder="https://api.deepseek.com/v1" 
                          className="bg-white" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="font-medium text-sm text-edu-fgSecondary">AI Model</label>
                      <div className="col-span-2">
                        <Input 
                          value={aiModel} 
                          onChange={e => setAiModel(e.target.value)} 
                          placeholder="deepseek-chat" 
                          className="bg-white" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="font-medium text-sm text-edu-fgSecondary">API Key</label>
                      <div className="col-span-2">
                        <Input 
                          type="password"
                          value={aiApiKey} 
                          onChange={e => setAiApiKey(e.target.value)} 
                          placeholder="sk-..." 
                          className="bg-white" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* MiMo Pricing */}
                  <div>
                    <h4 className="font-semibold text-edu-fg mb-4 flex items-center gap-2 text-orange-600"><DollarSign size={16}/> Xiaomi MiMo</h4>
                    <div className="space-y-3 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Input Cache Hit (USD / 1M Tokens)</label>
                        <Input type="number" step="0.0001" value={mimoPriceHit} onChange={e => setMimoPriceHit(e.target.value)} className="bg-white"/>
                      </div>
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Input Cache Miss (USD / 1M)</label>
                        <Input type="number" step="0.0001" value={mimoPriceMiss} onChange={e => setMimoPriceMiss(e.target.value)} className="bg-white"/>
                      </div>
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Output (USD / 1M Tokens)</label>
                        <Input type="number" step="0.0001" value={mimoPriceOut} onChange={e => setMimoPriceOut(e.target.value)} className="bg-white"/>
                      </div>
                    </div>
                  </div>

                  {/* OpenAI / DeepSeek Pricing */}
                  <div>
                    <h4 className="font-semibold text-edu-fg mb-4 flex items-center gap-2 text-blue-600"><DollarSign size={16}/> OpenAI/DeepSeek</h4>
                    <div className="space-y-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Input Cache Hit (USD / 1M Tokens)</label>
                        <Input type="number" step="0.0001" value={openAiPriceHit} onChange={e => setOpenAiPriceHit(e.target.value)} className="bg-white"/>
                      </div>
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Input Cache Miss (USD / 1M)</label>
                        <Input type="number" step="0.0001" value={openAiPriceMiss} onChange={e => setOpenAiPriceMiss(e.target.value)} className="bg-white"/>
                      </div>
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Output (USD / 1M Tokens)</label>
                        <Input type="number" step="0.0001" value={openAiPriceOut} onChange={e => setOpenAiPriceOut(e.target.value)} className="bg-white"/>
                      </div>
                    </div>
                  </div>

                  {/* Zhipu AI Pricing */}
                  <div>
                    <h4 className="font-semibold text-edu-fg mb-4 flex items-center gap-2 text-purple-600"><DollarSign size={16}/> Zhipu AI (GLM)</h4>
                    <div className="space-y-3 bg-purple-50/30 p-4 rounded-xl border border-purple-100">
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Input Cache Hit (USD / 1M Tokens)</label>
                        <Input type="number" step="0.0001" value={zhipuPriceHit} onChange={e => setZhipuPriceHit(e.target.value)} className="bg-white"/>
                      </div>
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Input Cache Miss (USD / 1M)</label>
                        <Input type="number" step="0.0001" value={zhipuPriceMiss} onChange={e => setZhipuPriceMiss(e.target.value)} className="bg-white"/>
                      </div>
                      <div>
                        <label className="text-xs text-edu-muted block mb-1">Output (USD / 1M Tokens)</label>
                        <Input type="number" step="0.0001" value={zhipuPriceOut} onChange={e => setZhipuPriceOut(e.target.value)} className="bg-white"/>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
          <div className="p-6 bg-gray-50/50 flex items-center justify-end gap-3 border-t border-edu-border">
            {saveStatus === 'success' && (
              <span className="text-green-600 flex items-center text-sm font-medium mr-2">
                <CheckCircle2 size={16} className="mr-1" /> Lưu thành công
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 flex items-center text-sm font-medium mr-2">
                <AlertCircle size={16} className="mr-1" /> Có lỗi xảy ra
              </span>
            )}
            <Button variant="secondary" onClick={() => setSaveStatus('idle')} disabled={isLoading || isSaving}>Hủy bỏ</Button>
            <Button 
              onClick={handleSaveAiSettings} 
              disabled={isLoading || isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Lưu cấu hình AI
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
