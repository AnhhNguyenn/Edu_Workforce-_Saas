import { CMS_Feature, CMS_Audience, CMS_BlogPost, CMS_CaseStudy } from "@/types/cms";

// ==========================================
// MOCK DATA (Thay thế bằng gọi API thật khi .NET CMS sẵn sàng)
// ==========================================

export const mockFeatures: CMS_Feature[] = [
  {
    id: "f1",
    title: "Quản lý học viên",
    slug: "quan-ly-hoc-vien",
    content: "Quản lý toàn bộ hồ sơ, lịch sử học tập và điểm danh của học viên trên một màn hình duy nhất.",
    status: "Published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    seo: {
      entityId: "f1",
      entityType: "Feature",
      metaTitle: "Phần mềm quản lý học viên hiệu quả nhất",
      metaDescription: "Giúp trung tâm tiết kiệm 80% thời gian quản lý hồ sơ học viên."
    }
  },
  {
    id: "f2",
    title: "Tự động xếp lịch",
    slug: "tu-dong-xep-lich",
    content: "Thuật toán xếp lịch thông minh giúp tránh trùng lịch giáo viên, học viên và phòng học.",
    status: "Published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  }
];

export const mockAudiences: CMS_Audience[] = [
  {
    id: "a1",
    title: "Trung tâm Tiếng Anh",
    slug: "trung-tam-tieng-anh",
    content: "Giải pháp thiết kế riêng cho các hệ thống trung tâm ngoại ngữ với nhiều chi nhánh.",
    status: "Published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  }
];

// ==========================================
// API CLIENT FUNCTIONS
// ==========================================

export async function getFeatures(): Promise<CMS_Feature[]> {
  // Tạm thời return mock data. Sau này: return fetch('https://api.eduops.vn/cms/features').then(r => r.json())
  return mockFeatures;
}

export async function getFeatureBySlug(slug: string): Promise<CMS_Feature | null> {
  const feature = mockFeatures.find(f => f.slug === slug);
  return feature || null;
}

export async function getAudiences(): Promise<CMS_Audience[]> {
  return mockAudiences;
}

export async function getAudienceBySlug(slug: string): Promise<CMS_Audience | null> {
  const audience = mockAudiences.find(a => a.slug === slug);
  return audience || null;
}
