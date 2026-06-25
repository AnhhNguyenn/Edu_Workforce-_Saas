import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
  roles: any[];
}

export function UserModal({ isOpen, onClose, onSuccess, user, roles }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    roleId: ""
  });
  const [error, setError] = useState("");

  const isEditing = !!user;

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (user) {
        setFormData({
          email: user.email || "",
          password: "",
          fullName: user.fullName || "",
          roleId: user.roleId || ""
        });
      } else {
        setFormData({
          email: "",
          password: "",
          fullName: "",
          roleId: ""
        });
      }
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.fullName || !formData.roleId || (!isEditing && !formData.password)) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await apiClient.put(`/users/${user.id}`, {
          fullName: formData.fullName,
          roleId: formData.roleId
        });
      } else {
        await apiClient.post("/users", {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          roleId: formData.roleId
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa Người dùng" : "Thêm mới Người dùng"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-edu-fg mb-1">Họ và tên</label>
            <Input
              name="fullName"
              placeholder="Nhập họ và tên..."
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-fg mb-1">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || isEditing}
            />
            {isEditing && <span className="text-xs text-edu-muted mt-1">Email không thể thay đổi</span>}
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-edu-fg mb-1">Mật khẩu</label>
              <Input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu..."
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-edu-fg mb-1">Phân quyền (Role)</label>
            <Select
              value={formData.roleId}
              onChange={(val) => setFormData((prev) => ({ ...prev, roleId: val }))}
              disabled={loading}
              placeholder="-- Chọn một quyền --"
              options={roles.map((r) => ({
                value: r.id,
                label: r.name + (r.isSystemRole ? " (Hệ thống)" : "")
              }))}
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
