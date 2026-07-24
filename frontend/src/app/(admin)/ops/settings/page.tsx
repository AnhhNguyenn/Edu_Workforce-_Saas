'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, Bot, DollarSign, Edit2, Save, X } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { useProfile, useUpdateProfile, useUploadOrganizationLogo } from "@/hooks/queries/useProfile";
import { useMySubscription } from "@/hooks/queries/useSubscriptions";
import { toast } from "react-hot-toast";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role || '';
  const { data: profile } = useProfile();
  const { data: sub } = useMySubscription();
  const setUpgradeModalOpen = useAppStore(state => state.setUpgradeModalOpen);
  const updateProfileMutation = useUpdateProfile();
  const uploadLogoMutation = useUploadOrganizationLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminFullName, setAdminFullName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminAddress, setAdminAddress] = useState("");

  const handleEditAdmin = () => {
    setAdminFullName(profile?.fullName || "");
    setAdminPhone(profile?.phone || "");
    setAdminAddress(profile?.address || "");
    setIsEditingAdmin(true);
  };

  const handleSaveAdmin = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: adminFullName,
        phone: adminPhone,
        address: adminAddress
      });
      toast.success("Cập nhật thông tin thành công!");
      setIsEditingAdmin(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật!");
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadLogoMutation.mutateAsync(file);
      toast.success("Cập nhật Logo thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên!");
    }
  };

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
    if (status === 'loading') return;

    const fetchSettings = async () => {
      if (userRole !== 'SUPER_ADMIN') {
        setIsLoading(false);
        return;
      }
      
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
  }, [status, userRole]);

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

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative mb-8">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-transparent"></div>
        <div className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            
            {/* Center Logo/Avatar */}
            <div className="flex flex-col items-center gap-4 shrink-0 mt-2">
              <div className="w-36 h-36 rounded-3xl bg-white shadow-xl shadow-blue-900/5 border border-white flex items-center justify-center overflow-hidden ring-4 ring-gray-50">
                {profile?.customLogoUrl ? (
                  <img src={profile.customLogoUrl} alt="Logo trung tâm" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-6xl font-extrabold text-blue-600 bg-gradient-to-br from-blue-100 to-indigo-50 w-full h-full flex items-center justify-center">
                    {profile?.organizationName ? profile.organizationName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLogoMutation.isPending}
                className="w-full text-xs h-9 rounded-full font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
              >
                {uploadLogoMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                Thay đổi Logo
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoChange} 
              />
            </div>

            {/* Basic Info Fields */}
            <div className="flex-1 w-full flex flex-col h-full justify-center space-y-8">
              
              {/* Thông tin chung */}
              <div id="thong-tin-chung" className="scroll-mt-24">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                  <h3 className="text-[17px] font-bold text-gray-900">Thông tin chung</h3>
                  {!isEditingAdmin ? (
                    <Button variant="ghost" size="sm" onClick={handleEditAdmin} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-3 rounded-lg font-medium text-xs">
                      <Edit2 size={14} className="mr-1.5" /> Sửa thông tin
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingAdmin(false)} className="text-gray-500 hover:bg-gray-100 h-8 px-3 rounded-lg font-medium text-xs">
                        Hủy
                      </Button>
                      <Button size="sm" onClick={handleSaveAdmin} disabled={updateProfileMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 rounded-lg font-bold text-xs shadow-sm">
                        {updateProfileMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />} Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Read-only system fields */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tên trung tâm</label>
                    <Input 
                      readOnly 
                      value={profile?.organizationName || "Chưa cập nhật"} 
                      className="bg-gray-50 border-gray-200 h-11 rounded-xl text-gray-700 font-medium focus:ring-0 cursor-not-allowed shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Trạng thái hệ thống</label>
                    <div className="h-11 rounded-xl bg-green-50 text-green-700 font-bold border border-green-100 flex items-center px-4 shadow-sm text-sm">
                      <CheckCircle2 size={16} className="mr-2" /> Đang hoạt động
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email đăng nhập</label>
                    <Input 
                      readOnly 
                      value={profile?.email || "Chưa cập nhật"} 
                      className="bg-gray-50 border-gray-200 h-11 rounded-xl text-gray-700 font-medium focus:ring-0 cursor-not-allowed shadow-sm" 
                    />
                  </div>

                  {/* Editable fields */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Họ và tên</label>
                    <Input 
                      readOnly={!isEditingAdmin}
                      value={isEditingAdmin ? adminFullName : (profile?.fullName || "Chưa cập nhật")} 
                      onChange={(e) => setAdminFullName(e.target.value)}
                      className={`h-11 rounded-xl text-gray-700 font-medium shadow-sm ${!isEditingAdmin ? 'bg-gray-50 border-gray-200 focus:ring-0 cursor-not-allowed' : 'bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                    <Input 
                      readOnly={!isEditingAdmin}
                      value={isEditingAdmin ? adminPhone : (profile?.phone || "Chưa cập nhật")} 
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className={`h-11 rounded-xl text-gray-700 font-medium shadow-sm ${!isEditingAdmin ? 'bg-gray-50 border-gray-200 focus:ring-0 cursor-not-allowed' : 'bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Địa chỉ</label>
                    <Input 
                      readOnly={!isEditingAdmin}
                      value={isEditingAdmin ? adminAddress : (profile?.address || "Chưa cập nhật")} 
                      onChange={(e) => setAdminAddress(e.target.value)}
                      className={`h-11 rounded-xl text-gray-700 font-medium shadow-sm ${!isEditingAdmin ? 'bg-gray-50 border-gray-200 focus:ring-0 cursor-not-allowed' : 'bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                    />
                  </div>
                </div>
              </div>

              {/* Plan Box */}
              <div className="mt-4 p-6 bg-[#2563EB] rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="text-blue-100 text-xs font-bold mb-2 uppercase tracking-wide">GÓI DỊCH VỤ HIỆN TẠI</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[28px] leading-none font-bold">{sub?.planName || "Đang tải..."}</span>
                    {sub?.subscriptionEnd && (
                      <span className="text-xs font-semibold text-white bg-[#1E40AF] px-3 py-1.5 rounded-full">
                        Hết hạn: {new Date(sub.subscriptionEnd).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => setUpgradeModalOpen(true)}
                  className="bg-white text-blue-600 hover:bg-gray-50 rounded-full font-bold px-6 py-2.5 h-auto shrink-0 shadow-sm border-0 hover:shadow-md transition-all whitespace-nowrap text-sm"
                >
                  Nâng cấp gói
                </Button>
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
