"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "EduOps thực sự là một cuộc cách mạng. Chúng tôi đã giảm từ 3 nhân sự giáo vụ xuống chỉ còn 1 người, trong khi quy mô học viên tăng gấp đôi.",
    author: "Nguyễn Minh Thu",
    role: "Giám đốc vận hành, EnglishNow",
    avatar: "NT",
    rating: 5,
  },
  {
    id: 2,
    quote: "Điều tôi thích nhất là tính năng Xếp lịch AI. Trước đây cứ mỗi dịp khai giảng là chúng tôi phải thức đêm để tránh trùng lịch giáo viên. Giờ chỉ mất 3 giây.",
    author: "Trần Bảo Long",
    role: "Founder, STEM Academy",
    avatar: "TL",
    rating: 5,
  },
  {
    id: 3,
    quote: "Ứng dụng dành cho phụ huynh rất tuyệt vời. Phụ huynh có thể xem điểm danh và điểm số ngay lập tức. Tính minh bạch giúp tỷ lệ tái tục của chúng tôi đạt 95%.",
    author: "Lê Hoàng Yến",
    role: "Trưởng phòng CSKH, MusicPro",
    avatar: "LY",
    rating: 5,
  }
];

export default function CustomersPage() {
  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen py-20 px-4 md:py-28 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 md:mb-24">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-700 border-indigo-200">
            Câu chuyện thành công
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Niềm tin từ <span className="text-indigo-600">500+</span> trung tâm
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Đừng chỉ nghe chúng tôi nói. Hãy xem cách các tổ chức giáo dục hàng đầu đang bứt phá doanh thu cùng EduOps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 60 }}
            >
              <Card className="h-full bg-white border-slate-200/60 shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] transition-all duration-300 rounded-3xl p-2">
                <CardContent className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg text-slate-700 font-medium leading-relaxed mb-8 flex-1 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                    <Avatar className="w-12 h-12 border-2 border-indigo-100">
                      <AvatarFallback className="bg-indigo-600 text-white font-bold">{t.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-slate-900">{t.author}</div>
                      <div className="text-sm text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
