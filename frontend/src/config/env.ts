/**
 * Chứa toàn bộ cấu hình môi trường của Frontend.
 * Sau này khi tích hợp Cloudflare (VD: thay đổi domain, API endpoint), 
 * chỉ cần sửa biến môi trường trong file .env và ánh xạ ở đây.
 */

export const ENV = {
  // Đường dẫn API Backend (Dành cho trình duyệt gọi)
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  
  // Đường dẫn API Backend nội bộ (Dành cho NextAuth Server gọi trong mạng Docker)
  INTERNAL_API_URL: process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',

  HUB_URL: process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:5001/hub/notifications',
  
  // Môi trường chạy (development, production)
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Cấu hình NextAuth (Dùng cho JWT Secret)
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'eduops-secret-key-2024',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // Các cấu hình tương lai cho Cloudflare Turnstile / R2 Storage có thể đặt tại đây
  // CLOUDFLARE_TURNSTILE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_KEY || '',
};
