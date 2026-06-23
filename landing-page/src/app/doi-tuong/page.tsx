"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

const audiences = [
  { id: "1", title: "Trung tâm Tiếng Anh", slug: "trung-tam-tieng-anh", content: "Tối ưu hóa quản lý hàng nghìn học viên, lịch học đa dạng và theo dõi chi tiết điểm số." },
  { id: "2", title: "Trung tâm Năng khiếu", slug: "trung-tam-nang-khieu", content: "Theo dõi quá trình rèn luyện, xếp lịch linh hoạt cho giáo viên và thông báo tức thời cho phụ huynh." }
];

export default function AudienceIndexPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16"
      >
        <Badge variant="outline" className="mb-3 md:mb-4 text-orange-600 border-orange-200 bg-orange-50 py-1 px-3 md:py-1.5 md:px-4 text-xs md:text-sm">
          <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" />
          Giải pháp chuyên biệt
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight">Giải Pháp Từng Mô Hình</h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
          Bất kể bạn là trung tâm tiếng Anh, gia sư hay STEM, chúng tôi đều có cấu hình tối ưu riêng.
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {audiences.map((aud) => (
          <motion.div variants={itemVariants} key={aud.id}>
            <Link href={`/doi-tuong/${aud.slug}`} className="group block h-full">
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 bg-white">
                <CardHeader className="p-5 md:p-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 text-orange-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <CardTitle className="text-lg md:text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                    {aud.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 md:px-6 pb-5 md:pb-6">
                  <CardDescription className="text-sm md:text-base text-gray-600 line-clamp-3 mb-4 md:mb-6">
                    {aud.content}
                  </CardDescription>
                  <div className="flex items-center text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
                    Xem giải pháp <ArrowRight className="ml-1 w-4 h-4" />
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
