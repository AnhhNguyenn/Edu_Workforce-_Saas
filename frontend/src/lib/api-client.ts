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

// Biến lưu trữ token trên bộ nhớ để tránh gọi getSession() liên tục gây chậm Web
let cachedToken: string | null = null;
let sessionPromise: Promise<any> | null = null;

// Interceptor: Gắn Token vào Header trước khi gửi request
apiClient.interceptors.request.use(
  async (config) => {
    // Chỉ lấy session ở phía Client. Ở Server component cần truyền token vào thủ công hoặc cấu hình khác.
    if (typeof window !== 'undefined') {
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
      } else {
        if (!sessionPromise) {
          sessionPromise = getSession();
        }
        const session = await sessionPromise;
        sessionPromise = null;
        if ((session as any)?.error === "RefreshAccessTokenError") {
          window.location.href = '/login?error=SessionExpired';
        } else if (session?.user && (session as any).accessToken) {
          cachedToken = (session as any).accessToken;
          config.headers.Authorization = `Bearer ${cachedToken}`;
        } else {
          console.log("=== API CLIENT: NO TOKEN FOUND IN SESSION ===");
        }
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
      if (typeof window !== 'undefined') {
        // Xóa token cũ để ép lấy token mới
        cachedToken = null;
        // Cập nhật promise để các request khác (nếu đang chờ) cũng được hưởng xái
        if (!sessionPromise) {
          sessionPromise = getSession();
        }
        const session = await sessionPromise;
        sessionPromise = null;
        if ((session as any)?.error === "RefreshAccessTokenError") {
          window.location.href = '/login?error=SessionExpired';
        } else if (session && (session as any).accessToken) {
          // Thử lại request với token mới
          cachedToken = (session as any).accessToken;
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${cachedToken}`;
          return axios(originalRequest);
        } else {
          window.location.href = '/login?error=SessionExpired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

