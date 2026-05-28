import axios from 'axios';
import { getSession } from 'next-auth/react';
import { ENV } from '@/config/env';

// Tạo Axios instance với base URL từ config tập trung
export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor: Gắn Token vào Header trước khi gửi request
apiClient.interceptors.request.use(
  async (config) => {
    // Chỉ lấy session ở phía Client. Ở Server component cần truyền token vào thủ công hoặc cấu hình khác.
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.user && (session as any).accessToken) {
        const tokenStr = (session as any).accessToken;
        console.log("=== API CLIENT SENDING TOKEN ===", tokenStr);
        config.headers.Authorization = `Bearer ${tokenStr}`;
      } else {
        console.log("=== API CLIENT: NO TOKEN FOUND IN SESSION ===");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý Response (Lỗi 401, 403, etc.)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Logic xử lý khi token hết hạn (ví dụ: gọi refresh token hoặc redirect về login)
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=SessionExpired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

