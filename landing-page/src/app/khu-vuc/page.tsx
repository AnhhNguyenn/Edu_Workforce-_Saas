"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

const locations = [
  { slug: "ha-noi", name: "Hà Nội", count: 120 },
  { slug: "tp-hcm", name: "TP. Hồ Chí Minh", count: 250 },
  { slug: "da-nang", name: "Đà Nẵng", count: 45 },
  { slug: "hai-phong", name: "Hải Phòng", count: 30 },
  { slug: "can-tho", name: "Cần Thơ", count: 25 },
];

export default function KhuVucIndexPage() {
  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen py-20 px-4 md:py-28 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 md:mb-24">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
            Mạng lưới toàn quốc
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            EduOps tại khu vực của bạn
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Dù trung tâm của bạn ở bất kỳ đâu, hệ thống đám mây của EduOps luôn đảm bảo tốc độ cực nhanh và hỗ trợ tại chỗ chuyên nghiệp.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {locations.map((loc, index) => (
            <motion.div
              key={loc.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/khu-vuc/${loc.slug}`} className="block h-full group">
                <Card className="h-full bg-white border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 rounded-2xl">
                  <CardHeader className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {loc.name}
                    </CardTitle>
                    <CardDescription className="text-slate-500 mt-2 flex items-center justify-between">
                      <span>{loc.count}+ trung tâm đang sử dụng</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
