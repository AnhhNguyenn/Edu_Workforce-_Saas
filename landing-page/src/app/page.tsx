"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, LayoutDashboard, Users, Banknote, ShieldCheck, Sparkles, TrendingUp, CalendarCheck, MapPin } from "lucide-react";

// Biến Animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  }
};

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden bg-[#FAFAFA]">
      
      {/* 1. HERO SECTION - Minimalist Premium */}
      <section className="relative w-full pt-16 pb-16 md:pt-28 md:pb-24 lg:pt-36 lg:pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract Light Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
        
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="flex flex-col items-center w-full max-w-4xl mx-auto relative z-10"
        >
          {/* Animated Promo Badge (Băng rôn quảng cáo uốn lượn gọn gàng) */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center w-full">
            <div className="relative group cursor-pointer inline-flex">
              {/* Lớp nền glow uốn lượn */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
              {/* Nội dung băng rôn (Hỗ trợ SEO) */}
              <div className="relative flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md border border-slate-100/50">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 shrink-0">
                  <Sparkles size={14} className="animate-spin-slow" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    <span className="hidden sm:inline">Khuyến mãi ra mắt:</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Giảm 20% EduOps V3.0</span>
                  </h2>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <h3 className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:inline">
                    Tặng thêm 3 tháng
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform ml-1 sm:ml-2">
                  <span className="hidden sm:inline">Nhận ưu đãi</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-tight">
            Nền tảng tối thượng <br className="hidden md:block"/> cho giáo dục
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl lg:text-2xl text-slate-500 mb-10 max-w-2xl leading-relaxed px-4 font-medium tracking-tight">
            Giải phóng 80% thời gian vận hành. Tự động hóa quy trình từ tuyển sinh, xếp lịch đến quản trị dòng tiền.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="rounded-full h-14 px-8 text-base font-semibold shadow-[0_8px_30px_rgb(37,99,235,0.24)] bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
              Bắt đầu miễn phí
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold bg-white shadow-sm hover:bg-slate-50 border-slate-200 text-slate-700 transition-all">
              Đặt lịch Demo
            </Button>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Không cần thẻ tín dụng</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Triển khai trong 5 phút</span>
          </motion.div>
        </motion.div>

        {/* Floating Minimalist Widgets */}
        <div className="w-full max-w-5xl mt-20 md:mt-24 relative z-10 hidden sm:flex justify-center h-[250px]">
           <motion.div 
             initial={{ opacity: 0, y: 50, rotate: -5 }}
             animate={{ opacity: 1, y: 0, rotate: -2 }}
             transition={{ duration: 1, type: "spring" }}
             className="absolute left-1/2 -ml-[300px] top-10"
           >
              <Card className="w-64 bg-white/90 backdrop-blur-xl border-slate-200/60 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                     </div>
                     <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">+35%</Badge>
                  </div>
                  <h3 className="text-slate-500 font-medium text-sm">Doanh thu tháng này</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">125.500.000₫</p>
                </CardContent>
              </Card>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 50, rotate: 5 }}
             animate={{ opacity: 1, y: 0, rotate: 2 }}
             transition={{ duration: 1, delay: 0.2, type: "spring" }}
             className="absolute right-1/2 -mr-[300px] top-0"
           >
              <Card className="w-64 bg-white/90 backdrop-blur-xl border-slate-200/60 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <CalendarCheck className="w-5 h-5" />
                     </div>
                     <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none">Đã xếp</Badge>
                  </div>
                  <h3 className="text-slate-500 font-medium text-sm">Lịch giảng dạy tuần</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">48 lớp</p>
                </CardContent>
              </Card>
           </motion.div>
        </div>
      </section>

      {/* 2. FEATURES BENTO GRID - Clean UI */}
      <section className="w-full py-20 relative px-4 sm:px-6 md:px-8 lg:px-12 bg-white border-t border-slate-100">
        <div className="w-full max-w-[1440px] mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Sức mạnh nguyên bản</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto px-2 font-medium tracking-tight">Được xây dựng dựa trên nhu cầu thực tế. Tối ưu hóa toàn diện từ lúc nhận dữ liệu học viên đến khi báo cáo tiến độ học tập.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {/* Large Card */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden group">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Xếp lịch thông minh & Chuyển đổi dữ liệu</CardTitle>
                  <CardDescription className="text-base text-slate-500 mt-2 font-medium">
                    Tính năng thiết kế riêng cho Center Admin: Tạo và quản lý lịch học cực kỳ nhanh chóng. Đặc biệt, nền tảng hỗ trợ "bê" toàn bộ lịch học cũ và dữ liệu trung tâm lên hệ thống mới chỉ trong chớp mắt, không làm gián đoạn vận hành.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Small Card 1 */}
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] hover:-translate-y-1 transition-all duration-300 rounded-3xl group">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Trợ lý AI Vận hành</CardTitle>
                  <CardDescription className="mt-2 text-base text-slate-500 font-medium">
                    Kết hợp AI một cách tinh tế để hỗ trợ tự động hóa các thao tác thủ công, giúp nhân sự làm việc rảnh tay hơn bao giờ hết.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Small Card 2 */}
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] hover:-translate-y-1 transition-all duration-300 rounded-3xl group">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Check-in/out ngoại viện</CardTitle>
                  <CardDescription className="mt-2 text-base text-slate-500 font-medium">
                    Dành riêng cho Giáo viên & Trợ giảng: Dễ dàng check-in, check-out và báo cáo điểm danh ngay tại các điểm dạy liên kết ở trường học khác.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Medium Card */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] hover:-translate-y-1 transition-all duration-300 rounded-3xl group">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Báo cáo tiến độ & Đánh giá kết quả</CardTitle>
                  <CardDescription className="mt-2 text-base text-slate-500 font-medium">
                    Quản lý sát sao báo cáo tiến độ học tập của từng lớp. Tự động hóa việc tổng hợp và gửi nhận xét định kỳ cho Phụ huynh một cách chuyên nghiệp.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. CTA SECTION */}
      <section className="w-full py-20 px-4 bg-[#FAFAFA]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-4xl mx-auto bg-slate-900 rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 mix-blend-overlay" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Thay đổi cách quản lý ngay hôm nay
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl font-medium">
              Hơn 500+ tổ chức giáo dục đang sử dụng EduOps để bứt phá doanh thu. Đăng ký ngay để trải nghiệm miễn phí 14 ngày.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" className="rounded-full h-14 px-8 text-base font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all">
                Bắt đầu dùng thử
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
