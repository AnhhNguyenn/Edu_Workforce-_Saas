            import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, CheckCircle2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const mockLocations = {
  "ha-noi": { name: "Hà Nội", address: "Tầng 10, Tòa nhà Lotte, 54 Liễu Giai, Ba Đình", count: 120 },
  "tp-hcm": { name: "TP. Hồ Chí Minh", address: "Tầng 5, Tòa nhà Bitexco, Quận 1", count: 250 },
  "da-nang": { name: "Đà Nẵng", address: "Tầng 3, Tòa nhà VNPT, Hải Châu", count: 45 },
};

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const loc = mockLocations[params.slug as keyof typeof mockLocations];
  if (!loc) return { title: "Không tìm thấy" };

  return {
    title: `Phần mềm quản lý trung tâm giáo dục tại ${loc.name} | EduOps`,
    description: `Giải pháp quản lý tự động hóa dành riêng cho các trung tâm tiếng Anh, gia sư tại ${loc.name}. Hiện có hơn ${loc.count} trung tâm đang tin dùng.`,
  };
}

export default async function KhuVucDetailPage(props: Props) {
  const params = await props.params;
  const loc = mockLocations[params.slug as keyof typeof mockLocations];

  if (!loc) notFound();

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pb-24">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 md:pt-28 md:pb-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-semibold mb-6">
            <MapPin className="w-4 h-4" /> Bản địa hóa 100%
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Phần mềm quản lý trung tâm <br className="hidden md:block" /> tốt nhất tại <span className="text-emerald-600">{loc.name}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Hơn {loc.count} tổ chức giáo dục tại {loc.name} đang sử dụng EduOps để tự động hóa vận hành, quản lý học viên và tối ưu dòng tiền.
          </p>
          <div className="flex justify-center gap-4">
             <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8 h-14 text-lg">Đăng ký dùng thử</Button>
             <Link href="tel:1900xxxx">
               <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-slate-300">
                 <PhoneCall className="w-5 h-5 mr-2" /> Hotline hỗ trợ
               </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 max-w-5xl mx-auto">
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Vì sao các trung tâm tại {loc.name} chọn EduOps?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Hỗ trợ trực tiếp tận nơi</h3>
                    <p className="text-slate-600 mt-1">Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ triển khai trực tiếp tại các quận huyện trên địa bàn {loc.name}.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Tối ưu hóa hành vi học viên địa phương</h3>
                    <p className="text-slate-600 mt-1">Giao diện điểm danh và tương tác với phụ huynh được tùy biến theo đúng thói quen của khu vực này.</p>
                  </div>
                </div>
              </div>
              <Card className="bg-slate-50 border-slate-100 shadow-none">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center h-full">
                  <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Văn phòng đại diện {loc.name}</h4>
                  <p className="text-slate-600">{loc.address}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
