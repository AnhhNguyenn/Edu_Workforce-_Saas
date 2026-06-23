import { getFeatureBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const feature = await getFeatureBySlug(params.slug);
  
  if (!feature) {
    return { title: "Không tìm thấy trang" };
  }

  // Tự động sử dụng CMS_SEO nếu có, nếu không lấy title mặc định
  return {
    title: feature.seo?.metaTitle || feature.title,
    description: feature.seo?.metaDescription || feature.content.substring(0, 160),
    alternates: {
      canonical: feature.seo?.canonicalUrl || `/tinh-nang/${feature.slug}`,
    },
  };
}

export default async function FeatureDetailPage(props: Props) {
  const params = await props.params;
  const feature = await getFeatureBySlug(params.slug);

  if (!feature) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900">{feature.title}</h1>
        <div className="prose prose-lg prose-blue max-w-none">
          <p>{feature.content}</p>
        </div>
        
        {/* Placeholder for FAQ Schema Output */}
        {feature.faqs && feature.faqs.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>
            <div className="space-y-4">
              {feature.faqs.map(faq => (
                <div key={faq.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <p className="text-gray-600 mt-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
