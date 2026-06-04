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
              orgId: user.organizationId
            } as any;
        }

        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${ENV.INTERNAL_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
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
              orgId: data.user.organizationId
            } as any;
          }
        } catch (e) {
          console.error("Login API error:", e);
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Đường dẫn trang login custom
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET as string,
};
