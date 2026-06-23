// Contract Models giữa Frontend Landing Page và Backend .NET CMS

export type ContentStatus = "Draft" | "Review" | "Published" | "Archived";

export interface CMS_SEO {
  entityId: string;
  entityType: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  robotsDirective?: string; // e.g. "index,follow"
}

export interface CMS_Author {
  id: string;
  name: string;
  jobTitle?: string;
  avatarUrl?: string;
  bio?: string;
  linkedinUrl?: string;
  createdAt: string;
}

export interface CMS_FAQ {
  id: string;
  entityId: string;
  entityType: string;
  question: string;
  answer: string;
  sortOrder: number;
}

// Bảng lịch sử chuyển hướng URL chống mất SEO 404
export interface CMS_SlugHistory {
  entityId: string;
  entityType: string;
  oldPath: string;
  newPath: string;
  createdAt: string;
}

// Model gốc chứa các thành phần dùng chung cho Feature, Blog, Audience...
export interface BaseEntity {
  id: string;
  title: string;
  slug: string;
  content: string; // NVARCHAR(MAX) lưu dạng HTML hoặc JSON
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  seo?: CMS_SEO;
  faqs?: CMS_FAQ[];
}

export interface CMS_BlogPost extends BaseEntity {
  authorId: string;
  author?: CMS_Author;
}

export interface CMS_Feature extends BaseEntity {}
export interface CMS_Audience extends BaseEntity {}
export interface CMS_Comparison extends BaseEntity {}
export interface CMS_CaseStudy extends BaseEntity {}
