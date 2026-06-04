import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    const role = (token?.role as string)?.toUpperCase()?.replace('-', '_'); // Chuẩn hóa thành SUPER_ADMIN hoặc CENTER_ADMIN

    // Route Guard Logic theo Role (Backend trả về chữ Hoa: SUPER_ADMIN, CENTER_ADMIN, TEACHER)
    if (path.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }
    
    if (path.startsWith("/center-admin") && role !== "CENTER_ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }

    if (path.startsWith("/teacher") && role !== "TEACHER" && role !== "ASSISTANT") {
      // Logic tuỳ biến: Center admin/Super admin có thể không được vào giao diện app giáo viên
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
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
    secret: process.env.NEXTAUTH_SECRET,
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
