import { getAudienceBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const audience = await getAudienceBySlug(params.slug);
  
  if (!audience) return { title: "Không tìm thấy trang" };

  return {
    title: audience.seo?.metaTitle || `Phần mềm quản lý cho ${audience.title}`,
    description: audience.seo?.metaDescription || audience.content.substring(0, 160),
    alternates: {
      canonical: audience.seo?.canonicalUrl || `/doi-tuong/${audience.slug}`,
    },
  };
}

export default async function AudienceDetailPage(props: Props) {
  const params = await props.params;
  const audience = await getAudienceBySlug(params.slug);

  if (!audience) notFound();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-10">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dành cho {audience.title}
        </h1>
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>{audience.content}</p>
        </div>
      </div>
    </div>
  );
}
