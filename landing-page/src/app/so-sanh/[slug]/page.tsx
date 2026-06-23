import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mock data
const mockComparisons = {
  "phan-mem-a": {
    competitorName: "Phần mềm A",
    title: "So sánh EduOps và Phần mềm A",
    description: "Khám phá lý do vì sao các trung tâm lớn quyết định chuyển đổi từ Phần mềm A sang EduOps.",
  }
};

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = mockComparisons[params.slug as keyof typeof mockComparisons];
  if (!data) return { title: "Không tìm thấy" };

  return {
    title: data.title,
    description: data.description,
  };
}

export default async function ComparisonDetailPage(props: Props) {
  const params = await props.params;
  const data = mockComparisons[params.slug as keyof typeof mockComparisons];

  if (!data) notFound();

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{data.title}</h1>
        <p className="text-xl text-slate-600">{data.description}</p>
      </div>

      <Card className="rounded-3xl shadow-sm border-slate-200">
        <CardContent className="p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-6">Tóm tắt khác biệt cốt lõi</h2>
          <ul className="space-y-6">
            <li className="flex gap-4 items-start">
               <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0" />
               <div>
                  <h3 className="font-semibold text-lg text-slate-900">EduOps tập trung vào Tự động hóa</h3>
                  <p className="text-slate-600 mt-1">Thay vì chỉ là nơi lưu trữ dữ liệu như {data.competitorName}, EduOps cung cấp bộ công cụ AI tự động xếp lịch và nhắc nhở học phí, tiết kiệm 80% thời gian tác vụ lặp lại.</p>
               </div>
            </li>
            <li className="flex gap-4 items-start">
               <XCircle className="w-8 h-8 text-slate-400 shrink-0" />
               <div>
                  <h3 className="font-semibold text-lg text-slate-900">{data.competitorName} thiếu kiểm soát dòng tiền chuyên sâu</h3>
                  <p className="text-slate-600 mt-1">{data.competitorName} thường chỉ dừng lại ở báo cáo rời rạc, yêu cầu bạn phải tự tổng hợp bằng Excel. Trong khi đó, EduOps tự động hóa 100% dòng tiền thu chi theo thời gian thực.</p>
               </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
