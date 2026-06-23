import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Globe, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">EduOps</span>
            </Link>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Hệ điều hành toàn diện dành riêng cho các trung tâm đào tạo, giúp tối ưu hóa 80% thời gian vận hành.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full bg-white text-gray-600 hover:text-blue-600">
                <Globe size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white text-gray-600 hover:text-red-600">
                <Mail size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white text-gray-600 hover:text-blue-700">
                <MessageSquare size={18} />
              </Button>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Sản Phẩm</h3>
            <ul className="space-y-3">
              <li><Link href="/tinh-nang" className="text-sm text-gray-600 hover:text-blue-600 transition">Tính năng nổi bật</Link></li>
              <li><Link href="/so-sanh" className="text-sm text-gray-600 hover:text-blue-600 transition">So sánh phần mềm</Link></li>
              <li><Link href="/bang-gia" className="text-sm text-gray-600 hover:text-blue-600 transition">Bảng giá</Link></li>
              <li><Link href="/khu-vuc" className="text-sm text-gray-600 hover:text-blue-600 transition">Khu vực</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Tài Nguyên</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm text-gray-600 hover:text-blue-600 transition">Blog & Kiến thức</Link></li>
              <li><Link href="/khach-hang" className="text-sm text-gray-600 hover:text-blue-600 transition">Khách hàng thành công</Link></li>
              <li><Link href="/tra-cuu" className="text-sm text-gray-600 hover:text-blue-600 transition">Tra cứu hướng dẫn</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Nhận bản tin</h3>
            <p className="text-sm text-gray-600 mb-4">Đăng ký để nhận các bí quyết quản lý trung tâm mới nhất.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
              <Button className="bg-gray-900 text-white hover:bg-gray-800">Gửi</Button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 EduOps Inc. Đã đăng ký bản quyền.
          </p>
          <div className="flex gap-6">
            <Link href="/dieu-khoan" className="text-sm text-gray-500 hover:text-gray-900">Điều khoản</Link>
            <Link href="/bao-mat" className="text-sm text-gray-500 hover:text-gray-900">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
