import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Strict Role-Based Access Control
    if (req.nextUrl.pathname.startsWith("/dashboard") && token?.role !== "ADMIN") {
      // Normal SDK users trying to access the admin CRM get redirected to their product
      return NextResponse.redirect(new URL("/verify", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true, // We handle routing logic in the middleware function above
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"]
};
