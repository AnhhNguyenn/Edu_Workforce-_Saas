"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

const blogs = [
  { id: "b1", title: "Cách quản lý trung tâm tiếng Anh hiệu quả năm 2026", slug: "cach-quan-ly-trung-tam-tieng-anh-hieu-qua", author: "Nguyễn Văn A", date: "20/06/2026" },
  { id: "b2", title: "Mẫu Excel điểm danh học viên miễn phí", slug: "mau-excel-diem-danh-hoc-vien", author: "Product Team", date: "15/06/2026" }
];

export default function BlogIndexPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16"
      >
        <Badge variant="outline" className="mb-3 md:mb-4 text-indigo-600 border-indigo-200 bg-indigo-50 py-1 px-3 md:py-1.5 md:px-4 text-xs md:text-sm">
          <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" />
          Góc chuyên gia
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight">Blog & Kiến Thức Vận Hành</h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
          Tuyệt chiêu quản trị nhân sự, thu hút học viên và tối ưu hóa doanh thu từ các chuyên gia EduOps.
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8"
      >
        {blogs.map((blog) => (
          <motion.div variants={itemVariants} key={blog.id}>
            <Link href={`/blog/${blog.slug}`} className="group block h-full">
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="w-full h-40 md:h-48 lg:h-56 bg-gradient-to-r from-gray-100 to-gray-50 group-hover:scale-105 transition-transform duration-500" />
                
                <CardHeader className="p-5 md:p-6 flex-1">
                  <CardTitle className="text-lg md:text-xl text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="p-4 md:p-5 flex justify-between text-xs md:text-sm text-gray-500 border-t pt-4 bg-gray-50/50">
                  <span className="font-medium text-gray-900">{blog.author}</span>
                  <span>{blog.date}</span>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
