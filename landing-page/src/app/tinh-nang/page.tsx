"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

// Mock data since it's client component now
const features = [
  { id: "1", title: "Quản lý học viên CRM", slug: "quan-ly-hoc-vien", content: "Quản lý toàn bộ hồ sơ, điểm số, lịch sử tương tác và tự động gửi báo cáo định kỳ." },
  { id: "2", title: "Xếp lịch AI", slug: "tu-dong-xep-lich", content: "Tự động xếp thời khóa biểu thông minh, chống trùng lặp chỉ trong 3 giây." }
];

export default function FeaturesIndexPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16"
      >
        <Badge variant="outline" className="mb-3 md:mb-4 text-blue-600 border-blue-200 bg-blue-50 py-1 px-3 md:py-1.5 md:px-4 text-xs md:text-sm">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" />
          Hệ sinh thái toàn diện
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight">Tính năng của EduOps</h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
          Từ tự động hóa xếp lịch đến quản trị dòng tiền, mọi công cụ bạn cần để vận hành trung tâm với 0 sai sót.
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {features.map((feature) => (
          <motion.div variants={itemVariants} key={feature.id}>
            <Link href={`/tinh-nang/${feature.slug}`} className="group block h-full">
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="p-5 md:p-6">
                  <CardTitle className="text-lg md:text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 md:px-6 pb-5 md:pb-6">
                  <CardDescription className="text-sm md:text-base text-gray-600 line-clamp-3 mb-4 md:mb-6">
                    {feature.content}
                  </CardDescription>
                  <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Tìm hiểu thêm <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
