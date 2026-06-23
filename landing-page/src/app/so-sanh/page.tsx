"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  { name: "Chi phí khởi tạo", eduops: "0đ (Miễn phí)", traditional: "5 - 10 triệu VNĐ" },
  { name: "Thời gian triển khai", eduops: "5 phút", traditional: "2 - 4 tuần" },
  { name: "Xếp lịch học tự động (AI)", eduops: true, traditional: false },
  { name: "Quản lý hồ sơ, điểm danh", eduops: "Tự động hóa", traditional: "Nhập liệu thủ công" },
  { name: "Kiểm soát dòng tiền (Thu/Chi)", eduops: true, traditional: "Báo cáo rời rạc" },
  { name: "Giao diện trên Mobile/Tablet", eduops: "Tối ưu 100%", traditional: "Khó thao tác" },
  { name: "Phân quyền theo vai trò (Role-based)", eduops: true, traditional: "Cơ bản" },
];

export default function CompareIndexPage() {
  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:pt-28 md:pb-24 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent blur-[80px] -z-10 rounded-full" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full bg-white text-blue-700 border-blue-200">
            Trực tiếp & Minh bạch
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Vì sao 500+ trung tâm <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">chọn EduOps?</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            So sánh trực diện tính năng, chi phí và hiệu quả vận hành giữa nền tảng EduOps hiện đại và các giải pháp phần mềm truyền thống.
          </p>
        </motion.div>
      </section>

      {/* Comparison Table Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[300px] py-6 px-6 text-lg font-bold text-slate-900">Tính năng & Tiêu chí</TableHead>
                    <TableHead className="py-6 px-6 text-lg font-bold text-blue-700 text-center bg-blue-50/50">EduOps V3.0</TableHead>
                    <TableHead className="py-6 px-6 text-lg font-bold text-slate-500 text-center">Giải pháp Truyền thống</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-5 px-6 font-medium text-slate-700">{item.name}</TableCell>
                      <TableCell className="py-5 px-6 text-center bg-blue-50/30">
                        {typeof item.eduops === 'boolean' ? (
                          item.eduops ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" /> : <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                        ) : (
                          <span className="font-semibold text-blue-700">{item.eduops}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-5 px-6 text-center">
                        {typeof item.traditional === 'boolean' ? (
                          item.traditional ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" /> : <XCircle className="w-6 h-6 text-slate-300 mx-auto" />
                        ) : (
                          <span className="text-slate-500">{item.traditional}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Bạn đã sẵn sàng nâng cấp?</h4>
                <p className="text-slate-500">Dữ liệu của bạn sẽ được chuyển đổi sang EduOps miễn phí.</p>
              </div>
              <div className="flex gap-4">
                 <Link href="/so-sanh/phan-mem-a">
                   <Button variant="outline" className="rounded-xl">Xem so sánh chi tiết</Button>
                 </Link>
                 <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md">Dùng thử miễn phí</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
