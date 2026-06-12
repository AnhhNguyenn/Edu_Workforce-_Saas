import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Use custom cookie name so it does not clash with the frontend app on localhost
  const cookieName = process.env.NODE_ENV === "production" ? "__Secure-superadmin.session-token" : "superadmin.session-token";
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: cookieName
  });

  const path = req.nextUrl.pathname;

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  const role = (token?.role as string)?.toUpperCase()?.replace('-', '_'); // Chuẩn hóa thành SUPER_ADMIN hoặc CENTER_ADMIN

  const redirectWithAccessDenied = () => {
    const response = NextResponse.redirect(new URL("/login", req.url));
    // Dùng cookie tồn tại trong 10 giây để truyền lỗi (Flash Message)
    response.cookies.set("auth_error", "access-denied", { path: "/", maxAge: 10 });
    return response;
  };

  // Super Admin App - Chặn mọi truy cập nếu không phải SUPER_ADMIN
  if (role !== "SUPER_ADMIN") {
    return redirectWithAccessDenied();
  }

  return NextResponse.next();
}

// Áp dụng middleware bảo vệ các route nào?
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
