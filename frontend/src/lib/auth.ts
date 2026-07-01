import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ENV } from "@/config/env";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Nhập địa chỉ email..." },
        password: { label: "Password", type: "password" },
        accessToken: { label: "Token", type: "text" },
        refreshToken: { label: "RefreshToken", type: "text" },
        userStr: { label: "User", type: "text" }
      },
      async authorize(credentials, req) {
        if (credentials?.accessToken && credentials?.userStr) {
            // Bypass mode: Login page already handled the API and 2FA
            const user = JSON.parse(credentials.userStr);
            return {
              id: user.id,
              name: user.fullName,
              email: user.email,
              role: user.role,
              token: credentials.accessToken,
              refreshToken: credentials.refreshToken,
              orgId: user.organizationId
            } as any;
        }

        if (!credentials?.email || !credentials?.password) return null;

        try {
          const forwardedFor = req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || '127.0.0.1';
          const userAgent = req.headers?.['user-agent'] || 'Next.js API';

          const res = await fetch(`${ENV.INTERNAL_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 
              "Content-Type": "application/json",
              "X-Forwarded-For": forwardedFor,
              "User-Agent": userAgent
            }
          });
          
          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          if (data && data.requires2FA) {
            throw new Error(`2FA_REQUIRED:${data.tempToken}`);
          }
          
          if (data && data.accessToken && data.user) {
            return {
              id: data.user.id,
              name: data.user.fullName,
              email: data.user.email,
              role: data.user.roleCode, // <-- Backend trả về roleCode
              token: data.accessToken,
              refreshToken: data.refreshToken,
              orgId: data.user.organizationId
            } as any;
          }
        } catch (e: any) {
          console.error("Login API error:", e);
          if (e.message?.startsWith('2FA_REQUIRED:')) {
            throw e;
          }
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Nếu có user mới đăng nhập → ghi đè token hoàn toàn (xóa error cũ nếu có)
      if (user) {
        return {
          ...token,
          role: (user as any).role,
          accessToken: (user as any).token,
          refreshToken: (user as any).refreshToken,
          error: undefined, // Xóa error cũ khi login thành công
          accessTokenExpires: (() => {
            try {
              const parts = ((user as any).token as string).split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return payload.exp * 1000;
              }
            } catch (e) {
              console.error("Lỗi khi parse JWT", e);
            }
            return undefined;
          })()
        };
      }

      // ĐÃ FAIL REFRESH TRƯỚC ĐÓ → không cố refresh lại, trả về luôn để tránh loop vô hạn
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Check if token has expired (with 10 seconds buffer)
      if (!token.accessTokenExpires) {
        return token; // If we don't know expiration, don't auto-refresh, let api-client handle it
      }

      if (Date.now() < (token.accessTokenExpires as number) - 10000) {
        return token;
      }

      // Token expired, refresh it
      try {
        const res = await fetch(`${ENV.INTERNAL_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken
          })
        });

        const refreshedTokens = await res.json();
        if (!res.ok) throw refreshedTokens;

        let newExp = token.accessTokenExpires;
        try {
          const parts = refreshedTokens.accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            newExp = payload.exp * 1000;
          }
        } catch (e) {}

        return {
          ...token,
          accessToken: refreshedTokens.accessToken,
          accessTokenExpires: newExp,
          refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
          error: undefined // Xóa error nếu refresh thành công
        };
      } catch (error) {
        console.error("Lỗi khi refresh token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError"
        };
      }
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Đường dẫn trang login custom
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 ngày thay vì 30 ngày để đảm bảo bảo mật và không lưu session quá lâu
  },
  debug: true,
  secret: ENV.NEXTAUTH_SECRET as string,
};
