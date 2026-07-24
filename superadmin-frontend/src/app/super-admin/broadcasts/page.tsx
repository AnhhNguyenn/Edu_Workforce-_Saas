'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  useBroadcasts,
  useCreateBroadcast,
  useUpdateBroadcast,
  useDeleteBroadcast,
  useSendBroadcast,
  useRecallBroadcast,
  SystemBroadcastDto
} from '@/hooks/queries/useBroadcasts';
import { useOrganizations } from '@/hooks/queries/useOrganizations';
import { useUsers } from '@/hooks/queries/useUsers';
import {
  Megaphone,
  Plus,
  Send,
  Edit3,
  Trash2,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Users,
  Percent,
  Link2,
  Eye,
  Bell,
  ExternalLink,
  Loader2,
  Globe,
  Check,
  Building2,
  User,
  X,
  UserCheck,
  ShieldCheck,
  Search,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';

// Role Definition Map with clean, accurate Lucide Icons
const ROLE_OPTIONS = [
  { value: 'CENTER_ADMIN', label: 'Admin Trung tâm', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: ShieldCheck },
  { value: 'TEACHER', label: 'Giáo viên', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: User },
  { value: 'ASSISTANT', label: 'Trợ giảng', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserCheck },
  { value: 'STUDENT', label: 'Học sinh / Phụ huynh', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Users }
];

// Broadcast Types Config
const BROADCAST_TYPES = [
  {
    value: 'info',
    label: 'Thông tin chung',
    desc: 'Tin tức, cập nhật hệ thống',
    icon: Info,
    badgeVariant: 'info' as BadgeVariant,
    bgClass: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600'
  },
  {
    value: 'success',
    label: 'Tính năng mới',
    desc: 'Thông báo ra mắt tính năng',
    icon: CheckCircle2,
    badgeVariant: 'success' as BadgeVariant,
    bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconColor: 'text-emerald-600'
  },
  {
    value: 'warn',
    label: 'Cảnh báo / Bảo trì',
    desc: 'Nhắc nhở, bảo trì định kỳ',
    icon: AlertTriangle,
    badgeVariant: 'warn' as BadgeVariant,
    bgClass: 'bg-amber-50 border-amber-200 text-amber-800',
    iconColor: 'text-amber-600'
  },
  {
    value: 'danger',
    label: 'Khẩn cấp / Sự cố',
    desc: 'Thông báo sự cố quan trọng',
    icon: AlertOctagon,
    badgeVariant: 'danger' as BadgeVariant,
    bgClass: 'bg-rose-50 border-rose-200 text-rose-800',
    iconColor: 'text-rose-600'
  }
];

export default function BroadcastsPage() {
  const [page, setPage] = useState(1);
  const { data: broadcastsData, isLoading } = useBroadcasts(page, 50);
  const broadcasts = broadcastsData?.items || [];

  // Fetch Organizations & Users for targeting
  const { data: orgsData } = useOrganizations(undefined, 1, 200);
  const organizations = orgsData?.items || [];

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const createMutation = useCreateBroadcast();
  const updateMutation = useUpdateBroadcast();
  const deleteMutation = useDeleteBroadcast();
  const sendMutation = useSendBroadcast();
  const recallMutation = useRecallBroadcast();

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'send' | 'recall' | 'delete' | null;
    targetId: string | null;
    title: string;
    description: string;
    variant: 'success' | 'warn' | 'danger' | 'primary';
    confirmText: string;
  }>({
    isOpen: false,
    type: null,
    targetId: null,
    title: '',
    description: '',
    variant: 'success',
    confirmText: 'Xác nhận'
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      message: '',
      type: 'info',
      actionLink: '',
      targetRoles: '',
      targetPercentage: 100
    }
  });

  const watchedTitle = watch('title');
  const watchedMessage = watch('message');
  const watchedType = watch('type');
  const watchedTargetRoles = watch('targetRoles');
  const watchedTargetPercentage = watch('targetPercentage');
  const watchedActionLink = watch('actionLink');

  // Fetch Users based on role filter & selected organization
  const { data: usersData, isLoading: isLoadingUsers } = useUsers(
    watchedTargetRoles || undefined,
    undefined,
    1,
    500,
    selectedOrgId || undefined
  );
  const allUsers = usersData?.items || [];

  const selectedOrgObj = organizations.find(o => o.id === selectedOrgId);

  // Filter users strictly by selectedOrgId if chosen
  const filteredUsers = useMemo(() => {
    if (!selectedOrgId) return allUsers;
    return allUsers.filter(u =>
      u.organizationId === selectedOrgId ||
      (u as any).tenantId === selectedOrgId ||
      (selectedOrgObj && u.organizationName === selectedOrgObj.name)
    );
  }, [allUsers, selectedOrgId, selectedOrgObj]);

  // Convert comma-separated roles to array
  const selectedRoleArray = watchedTargetRoles ? watchedTargetRoles.split(',').map(r => r.trim()).filter(Boolean) : [];

  // Dynamic Section Title for Step 3 based on selected role
  const specificUserTitle = useMemo(() => {
    if (selectedRoleArray.length === 1) {
      const roleVal = selectedRoleArray[0];
      if (roleVal === 'TEACHER') return 'Chọn Giáo viên cụ thể (Tùy chọn đích danh)';
      if (roleVal === 'CENTER_ADMIN') return 'Chọn Admin Trung tâm cụ thể (Tùy chọn đích danh)';
      if (roleVal === 'ASSISTANT') return 'Chọn Trợ giảng cụ thể (Tùy chọn đích danh)';
      if (roleVal === 'STUDENT') return 'Chọn Học sinh / Phụ huynh cụ thể (Tùy chọn đích danh)';
    }
    return 'Chọn Người dùng / Nhân sự cụ thể (Tùy chọn đích danh)';
  }, [selectedRoleArray]);

  const toggleRole = (roleValue: string) => {
    setSelectedUserId(''); // reset specific user selection
    if (selectedRoleArray.includes(roleValue)) {
      const nextRoles = selectedRoleArray.filter(r => r !== roleValue).join(',');
      setValue('targetRoles', nextRoles);
    } else {
      const nextRoles = [...selectedRoleArray, roleValue].join(',');
      setValue('targetRoles', nextRoles);
    }
  };

  const selectAllRoles = () => {
    setSelectedUserId('');
    setValue('targetRoles', '');
  };

  const onSubmit = (data: any) => {
    let finalTargetRoles = data.targetRoles || '';

    // If specific user selected, append user marker
    if (selectedUserId) {
      finalTargetRoles = data.targetRoles ? `${data.targetRoles},USER:${selectedUserId}` : `USER:${selectedUserId}`;
    }

    // If organization selected, append org marker
    if (selectedOrgId) {
      finalTargetRoles = finalTargetRoles ? `${finalTargetRoles},ORG:${selectedOrgId}` : `ORG:${selectedOrgId}`;
    }

    const payload = {
      ...data,
      targetRoles: finalTargetRoles,
      targetPercentage: selectedUserId ? 100 : (Number(data.targetPercentage) || 100)
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success('Cập nhật bản tin thành công');
          closeModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật')
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Tạo bản tin thành công');
          closeModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo mới')
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedOrgId('');
    setSelectedUserId('');
    reset({
      title: '',
      message: '',
      type: 'info',
      actionLink: '',
      targetRoles: '',
      targetPercentage: 100
    });
  };

  const openEdit = (b: SystemBroadcastDto) => {
    setEditingId(b.id);
    setValue('title', b.title);
    setValue('message', b.message);
    setValue('type', b.type || 'info');
    setValue('actionLink', b.actionLink || '');
    setValue('targetPercentage', b.targetPercentage || 100);

    // Extract ORG and USER markers if present
    let rawRoles = b.targetRoles || '';
    let extractedOrgId = '';
    let extractedUserId = '';

    const tokens = rawRoles.split(',').map(r => r.trim()).filter(Boolean);
    const cleanRoles: string[] = [];

    tokens.forEach(token => {
      if (token.startsWith('ORG:')) {
        extractedOrgId = token.replace('ORG:', '');
      } else if (token.startsWith('USER:')) {
        extractedUserId = token.replace('USER:', '');
      } else {
        cleanRoles.push(token);
      }
    });

    setValue('targetRoles', cleanRoles.join(','));
    setSelectedOrgId(extractedOrgId);
    setSelectedUserId(extractedUserId);
    setIsModalOpen(true);
  };

  // Action Triggers for Confirmation Modal
  const promptSend = (b: SystemBroadcastDto) => {
    setConfirmModal({
      isOpen: true,
      type: 'send',
      targetId: b.id,
      title: `Phát sóng thông báo "${b.title}"`,
      description: `Bạn có chắc chắn muốn phát sóng ngay thông báo này đến ${b.targetRoles ? b.targetRoles : 'toàn bộ'} người dùng (${b.targetPercentage}%)?`,
      variant: 'success',
      confirmText: 'Phát sóng ngay'
    });
  };

  const promptRecall = (b: SystemBroadcastDto) => {
    setConfirmModal({
      isOpen: true,
      type: 'recall',
      targetId: b.id,
      title: `Thu hồi thông báo "${b.title}"`,
      description: 'Hệ thống sẽ gỡ thông báo này khỏi bảng tin của người dùng. Bạn có chắc chắn muốn thu hồi?',
      variant: 'warn',
      confirmText: 'Thu hồi'
    });
  };

  const promptDelete = (b: SystemBroadcastDto) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      targetId: b.id,
      title: `Xóa bản tin "${b.title}"`,
      description: 'Hành động này sẽ xóa vĩnh viễn bản tin phát sóng này khỏi cơ sở dữ liệu.',
      variant: 'danger',
      confirmText: 'Xóa vĩnh viễn'
    });
  };

  const handleConfirmAction = () => {
    const { type, targetId } = confirmModal;
    if (!targetId || !type) return;

    if (type === 'send') {
      sendMutation.mutate(targetId, {
        onSuccess: () => {
          toast.success('Đã phát sóng thông báo thành công!');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi phát sóng')
      });
    } else if (type === 'recall') {
      recallMutation.mutate(targetId, {
        onSuccess: () => {
          toast.success('Đã thu hồi thông báo!');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi thu hồi')
      });
    } else if (type === 'delete') {
      deleteMutation.mutate(targetId, {
        onSuccess: () => {
          toast.success('Đã xóa bản tin!');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa bản tin')
      });
    }
  };

  const activeTypeConfig = BROADCAST_TYPES.find(t => t.value === watchedType) || BROADCAST_TYPES[0];
  const TypeIcon = activeTypeConfig.icon;

  const selectedUserObj = filteredUsers.find(u => u.id === selectedUserId);

  // Options for Organization Select
  const orgSelectOptions = useMemo(() => {
    return [
      { value: '', label: 'Tất cả Trung tâm / Cơ sở (Default All)' },
      ...organizations.map(o => ({
        value: o.id,
        label: `${o.name} (${o.code || 'Mã cơ sở'})`
      }))
    ];
  }, [organizations]);

  // Options for User Select
  const userSelectOptions = useMemo(() => {
    const defaultLabel = selectedOrgObj
      ? `Tất cả nhân sự thuộc ${selectedOrgObj.name}`
      : 'Tất cả nhân sự trong nhóm này';

    return [
      { value: '', label: defaultLabel },
      ...filteredUsers.map(u => ({
        value: u.id,
        label: `${u.fullName} (${u.email}) ${u.organizationName ? `- ${u.organizationName}` : ''}`
      }))
    ];
  }, [filteredUsers, selectedOrgObj]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-edu-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-edu-accentLight text-edu-accent flex items-center justify-center shrink-0">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-edu-fg">Phát sóng Thông báo (System Broadcast)</h1>
            <p className="text-edu-muted text-sm mt-0.5">
              Soạn thảo và gửi thông báo chung, cập nhật hoặc cảnh báo sự cố đến toàn bộ người dùng trên nền tảng.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            reset({
              title: '',
              message: '',
              type: 'info',
              actionLink: '',
              targetRoles: '',
              targetPercentage: 100
            });
            setSelectedOrgId('');
            setSelectedUserId('');
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="shrink-0 gap-2 font-semibold shadow-sm"
        >
          <Plus size={18} /> Tạo mới thông báo
        </Button>
      </div>

      {/* Broadcasts List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-edu-border overflow-hidden">
        <div className="p-4 border-b border-edu-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-edu-accent" />
            <span className="font-bold text-edu-fg text-sm">Danh sách Bản tin Phát sóng</span>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {broadcasts.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-edu-border bg-slate-50/80 text-xs uppercase font-semibold text-edu-muted tracking-wider">
                <th className="p-4">Tiêu đề & Nội dung</th>
                <th className="p-4">Loại tin</th>
                <th className="p-4">Đối tượng nhận</th>
                <th className="p-4">Tỷ lệ (% User)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edu-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-edu-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-edu-accent" size={24} />
                      <span>Đang tải danh sách thông báo...</span>
                    </div>
                  </td>
                </tr>
              ) : broadcasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-edu-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Megaphone className="text-slate-300" size={32} />
                      <span className="font-semibold text-slate-600">Chưa có bản tin thông báo nào.</span>
                      <p className="text-xs text-slate-400">Bấm nút "+ Tạo mới thông báo" để bắt đầu gửi thông báo hệ thống.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                broadcasts.map(b => {
                  const typeConfig = BROADCAST_TYPES.find(t => t.value === b.type) || BROADCAST_TYPES[0];
                  const IconComp = typeConfig.icon;
                  const roleList = b.targetRoles ? b.targetRoles.split(',').map(r => r.trim()) : [];

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-md">
                        <div className="font-bold text-edu-fg line-clamp-1">{b.title}</div>
                        <div className="text-edu-muted text-xs line-clamp-2 mt-0.5">{b.message}</div>
                        {b.actionLink && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-edu-accent font-medium">
                            <Link2 size={12} /> {b.actionLink}
                          </div>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={typeConfig.badgeVariant} className="gap-1.5 py-1 px-2.5">
                          <IconComp size={13} />
                          {typeConfig.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {roleList.length === 0 ? (
                          <Badge variant="info" className="gap-1.5 py-1 px-2.5">
                            <Globe size={13} />
                            <span>Tất cả người dùng (All)</span>
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {roleList.map(r => {
                              if (r.startsWith('ORG:')) {
                                const orgId = r.replace('ORG:', '');
                                const org = organizations.find(o => o.id === orgId);
                                return (
                                  <Badge key={r} variant="info" className="gap-1 py-0.5 px-2 bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Building2 size={12} />
                                    <span>{org ? `Cơ sở: ${org.name}` : 'Trung tâm chọn lọc'}</span>
                                  </Badge>
                                );
                              }

                              if (r.startsWith('USER:')) {
                                const userId = r.replace('USER:', '');
                                const user = allUsers.find(u => u.id === userId);
                                return (
                                  <Badge key={r} variant="info" className="gap-1 py-0.5 px-2 bg-blue-50 text-blue-700 border border-blue-200">
                                    <User size={12} />
                                    <span>{user ? `Đích danh: ${user.fullName}` : 'Cá nhân chọn lọc'}</span>
                                  </Badge>
                                );
                              }

                              const matchOption = ROLE_OPTIONS.find(opt => opt.value === r);
                              if (matchOption) {
                                const RoleIcon = matchOption.icon;
                                return (
                                  <Badge key={r} variant="info" className={`gap-1 py-0.5 px-2 ${matchOption.color}`}>
                                    <RoleIcon size={12} />
                                    <span>{matchOption.label}</span>
                                  </Badge>
                                );
                              }

                              return (
                                <Badge key={r} variant="muted" className="gap-1 py-0.5 px-2">
                                  <span>{r}</span>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-edu-fg">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-edu-accent h-full rounded-full"
                              style={{ width: `${b.targetPercentage || 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{b.targetPercentage || 100}%</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {b.isRecalled ? (
                          <Badge variant="danger">Đã thu hồi</Badge>
                        ) : b.isSent ? (
                          <Badge variant="success">Đã phát sóng</Badge>
                        ) : (
                          <Badge variant="warn">Bản nháp</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!b.isSent && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(b)}
                                className="text-edu-accent hover:bg-edu-accentLight"
                                title="Chỉnh sửa"
                              >
                                <Edit3 size={15} />
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => promptSend(b)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 py-1"
                                title="Phát sóng"
                              >
                                <Send size={13} /> Phát sóng
                              </Button>
                            </>
                          )}
                          {b.isSent && !b.isRecalled && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => promptRecall(b)}
                              className="text-xs gap-1 py-1"
                              title="Thu hồi thông báo"
                            >
                              <RotateCcw size={13} /> Thu hồi
                            </Button>
                          )}
                          {(!b.isSent || b.isRecalled) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => promptDelete(b)}
                              className="text-rose-600 hover:bg-rose-50"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 size={15} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-edu-accentLight text-edu-accent flex items-center justify-center shrink-0">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-edu-fg leading-tight">
                {editingId ? 'Chỉnh sửa Bản tin Phát sóng' : 'Tạo Bản tin Phát sóng Mới'}
              </h2>
              <p className="text-xs text-edu-muted font-normal">Cấu hình thông báo gửi tới người dùng trong hệ thống SaaS</p>
            </div>
          </div>
        }
        className="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="secondary" onClick={closeModal} disabled={createMutation.isPending || updateMutation.isPending}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="gap-2 px-6 shadow-sm"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
              {editingId ? 'Lưu cập nhật' : 'Tạo bản tin'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Nội dung chính */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-edu-fg mb-1.5">
                Tiêu đề thông báo <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('title', { required: true })}
                placeholder="VD: Thông báo bảo trì nâng cấp hệ thống định kỳ..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-edu-fg mb-1.5">
                Nội dung chi tiết <span className="text-rose-500">*</span>
              </label>
              <Textarea
                {...register('message', { required: true })}
                rows={3}
                placeholder="Nhập nội dung chi tiết thông báo sẽ gửi tới màn hình người dùng..."
              />
            </div>
          </div>

          {/* Section 2: Loại thông báo */}
          <div>
            <label className="block text-sm font-bold text-edu-fg mb-2">
              Loại thông báo (Mức độ ưu tiên)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BROADCAST_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = watchedType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue('type', t.value)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${isSelected
                      ? `${t.bgClass} ring-2 ring-edu-accent shadow-sm`
                      : 'border-edu-border bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <Icon size={18} className={isSelected ? t.iconColor : 'text-slate-400'} />
                      {isSelected && <div className="w-2 h-2 rounded-full bg-edu-accent" />}
                    </div>
                    <span className="text-xs font-bold leading-snug">{t.label}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Cấu hình phân tầng Đối tượng (Sạch sẽ, Chuẩn mực UI) */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-edu-border space-y-5">
            {/* 1. Chọn Trung tâm / Cơ sở Dropdown */}
            <div>
              <div className="mb-1.5">
                <label className="block text-sm font-bold text-edu-fg flex items-center gap-1.5">
                  <Building2 size={16} className="text-edu-accent" /> Chọn Trung tâm / Cơ sở
                </label>
              </div>
              <Select
                options={orgSelectOptions}
                value={selectedOrgId}
                onChange={(val) => {
                  setSelectedOrgId(val);
                  setSelectedUserId('');
                }}
              />
            </div>

            {/* 2. Chọn Vai trò (Target Roles) */}
            <div className="pt-3 border-t border-slate-200/60">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-edu-fg flex items-center gap-1.5">
                  <Users size={16} className="text-edu-accent" /> Chọn Vai trò nhận thông báo
                </label>
                <button
                  type="button"
                  onClick={selectAllRoles}
                  className={`text-xs font-bold transition-colors flex items-center gap-1 ${selectedRoleArray.length === 0 ? 'text-edu-accent' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {selectedRoleArray.length === 0 ? <Check size={13} /> : null} Tất cả vai trò
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllRoles}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${selectedRoleArray.length === 0
                    ? 'bg-edu-accent text-white border-edu-accent shadow-sm'
                    : 'bg-white text-slate-700 border-edu-border hover:bg-slate-100'
                    }`}
                >
                  <Globe size={14} /> Tất cả người dùng
                </button>
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRoleArray.includes(role.value);
                  const RoleIcon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected
                        ? `${role.color} border-current ring-2 ring-current shadow-sm`
                        : 'bg-white text-slate-700 border-edu-border hover:bg-slate-100'
                        }`}
                    >
                      <RoleIcon size={14} />
                      <span>{role.label}</span>
                      {isSelected ? <Check size={13} /> : <Plus size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Chọn Người dùng / Giáo viên cụ thể (Chỉ hiện khi ĐÃ chọn Trung tâm hoặc Vai trò) */}
            {(selectedOrgId || selectedRoleArray.length > 0) && (
              <div className="pt-3 border-t border-slate-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-edu-fg flex items-center gap-1.5">
                    <User size={16} className="text-edu-accent" />
                    <span>{specificUserTitle}</span>
                  </label>
                  {isLoadingUsers && <Loader2 size={14} className="animate-spin text-edu-accent" />}
                </div>

                <Select
                  options={userSelectOptions}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                />

                {selectedUserObj && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 flex items-center gap-2">
                    <User size={15} className="text-blue-600 shrink-0" />
                    <span>Đang chọn đích danh: <strong>{selectedUserObj.fullName}</strong> ({selectedUserObj.email}) - Thông báo sẽ CHỈ gửi riêng cho tài khoản này.</span>
                  </div>
                )}
              </div>
            )}

            {/* 4. Target Percentage & Action Link */}
            {!selectedUserId && (
              <div className="pt-3 border-t border-slate-200/60 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-edu-fg mb-1.5 flex items-center gap-1.5">
                    <Percent size={16} className="text-edu-accent" /> Tỷ lệ nhận (% ngẫu nhiên)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...register('targetPercentage')}
                      className="w-20 text-center font-bold h-9"
                    />
                    <div className="flex items-center gap-1.5">
                      {[
                        { pct: 25, label: '25%' },
                        { pct: 50, label: '50%' },
                        { pct: 75, label: '75%' },
                        { pct: 100, label: '100% (Tất cả)' }
                      ].map(({ pct, label }) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setValue('targetPercentage', pct)}
                          className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition-colors ${Number(watchedTargetPercentage) === pct
                            ? 'bg-edu-accent text-white border-edu-accent font-bold shadow-sm'
                            : 'bg-white text-slate-600 border-edu-border hover:bg-slate-100'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200/60">
              <label className="block text-sm font-bold text-edu-fg mb-1.5 flex items-center gap-1.5">
                <Link2 size={16} className="text-edu-accent" /> Đường dẫn hành động (Action Link)
              </label>
              <Input
                {...register('actionLink')}
                placeholder="VD: /ops/reports hoặc https://..."
              />
            </div>
          </div>

          {/* Section 4: Live Preview */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-edu-muted tracking-wider">
              <Eye size={14} className="text-edu-accent" /> Xem trước hiển thị trên màn hình người dùng
            </div>

            <div className={`p-4 rounded-xl border ${activeTypeConfig.bgClass} transition-all shadow-sm`}>
              <div className="flex items-start gap-3">
                <TypeIcon size={20} className={`${activeTypeConfig.iconColor} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {watchedTitle || 'Tiêu đề thông báo mẫu'}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-white/80 rounded border">
                      Vừa xong
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                    {watchedMessage || 'Nội dung thông báo chi tiết sẽ xuất hiện ở đây khi người dùng nhận được bản tin...'}
                  </p>

                  {watchedActionLink && (
                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-edu-accent hover:underline">
                        Xem chi tiết <ExternalLink size={12} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        isPending={sendMutation.isPending || recallMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
}
