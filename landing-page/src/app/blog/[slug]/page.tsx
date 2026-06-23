import { notFound } from "next/navigation";
import { Metadata } from "next";

// Dữ liệu mock tĩnh tạm thời
const mockBlogs = {
  "cach-quan-ly-trung-tam-tieng-anh-hieu-qua": {
    title: "Cách quản lý trung tâm tiếng Anh hiệu quả năm 2026",
    content: "Nội dung chi tiết bài viết hướng dẫn quản lý trung tâm tiếng anh...",
    author: { name: "Nguyễn Văn A", jobTitle: "Product Consultant tại EduOps" },
    publishedAt: "2026-06-20T08:00:00Z"
  }
};

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const blog = mockBlogs[params.slug as keyof typeof mockBlogs];
  if (!blog) return { title: "Không tìm thấy bài viết" };

  return {
    title: blog.title,
    description: blog.content.substring(0, 160),
    authors: [{ name: blog.author.name }],
  };
}

export default async function BlogDetailPage(props: Props) {
  const params = await props.params;
  const blog = mockBlogs[params.slug as keyof typeof mockBlogs];

  if (!blog) notFound();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-10">
        <h1 className="text-3xl font-extrabold mb-4 text-gray-900">{blog.title}</h1>
        
        {/* Author Entity E-E-A-T */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
            {blog.author.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{blog.author.name}</p>
            <p className="text-sm text-gray-500">{blog.author.jobTitle}</p>
            <time className="text-xs text-gray-400 block mt-1">Xuất bản: {new Date(blog.publishedAt).toLocaleDateString("vi-VN")}</time>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p>{blog.content}</p>
        </div>
      </div>
    </div>
  );
}
