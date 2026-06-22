import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Nếu refresh token đã hết hạn/lỗi → redirect về login, phá vòng lặp vô hạn
    if (token?.error === "RefreshAccessTokenError") {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("auth_error", "session_expired", { path: "/", maxAge: 10 });
      // Xóa next-auth session cookie để không bị loop
      response.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
      response.cookies.set("__Secure-next-auth.session-token", "", { path: "/", maxAge: 0 });
      return response;
    }
    
    const role = (token?.role as string)?.toUpperCase()?.replace('-', '_'); // Chuẩn hóa thành SUPER_ADMIN hoặc CENTER_ADMIN

    const redirectWithAccessDenied = () => {
      const response = NextResponse.redirect(new URL("/login", req.url));
      // Dùng cookie tồn tại trong 10 giây để truyền lỗi (Flash Message)
      response.cookies.set("auth_error", "access-denied", { path: "/", maxAge: 10 });
      return response;
    };

    // Route Guard Logic theo Role (Backend trả về chữ Hoa: SUPER_ADMIN, CENTER_ADMIN, TEACHER)
    // Lưu ý: Đã tách Super Admin ra một Next.js App riêng, nên ở đây chỉ quản lý Center Admin và Teacher
    
    if (path.startsWith("/ops") && role !== "CENTER_ADMIN" && role !== "SUPER_ADMIN") {
      return redirectWithAccessDenied();
    }

    if (path.startsWith("/me") && role !== "TEACHER" && role !== "ASSISTANT") {
      // Logic tuỳ biến: Center admin/Super admin có thể không được vào giao diện app giáo viên
      return redirectWithAccessDenied();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Chỉ chạy middleware với các request có token hợp lệ
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "eduops-secret-key-2024",
  }
);

// Áp dụng middleware bảo vệ các route nào?
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
