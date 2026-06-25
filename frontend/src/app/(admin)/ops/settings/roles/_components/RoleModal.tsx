import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: any;
}

export function RoleModal({ isOpen, onClose, onSuccess, role }: RoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [error, setError] = useState("");

  const isEditing = !!role;

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (role) {
        setFormData({
          name: role.name || "",
          description: role.description || ""
        });
      } else {
        setFormData({
          name: "",
          description: ""
        });
      }
    }
  }, [isOpen, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name) {
      setError("Vui lòng nhập tên vai trò!");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await apiClient.put(`/roles/${role.id}`, formData);
      } else {
        await apiClient.post("/roles", formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa Vai trò" : "Thêm mới Vai trò"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-edu-fg mb-1">Tên vai trò (Role Name) <span className="text-red-500">*</span></label>
            <Input
              name="name"
              placeholder="VD: Giáo viên, Kế toán..."
              value={formData.name}
              onChange={handleChange}
              disabled={loading || role?.isSystem}
            />
            {role?.isSystem && <span className="text-xs text-edu-muted mt-1">Không thể đổi tên vai trò hệ thống</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-fg mb-1">Mô tả chi tiết</label>
            <Textarea
              name="description"
              placeholder="Mô tả chức năng của vai trò này..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-edu-border mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={loading} className="bg-edu-accent hover:bg-edu-accentDark text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
