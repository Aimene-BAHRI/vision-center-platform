import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PATH = /^\/(?:fr|ar)\/admin/;
const ADMIN_LOGIN = /^\/(?:fr|ar)\/admin\/login/;

export async function middleware(request: NextRequest) {
  // Redirect bare root to default locale
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/fr", request.url));
  }

  // Step 1: run next-intl locale detection + rewrite
  const intlResponse = intlMiddleware(request);

  // Stamp detected locale on the response so app/layout.tsx can read it
  const locale = request.nextUrl.pathname.startsWith("/ar") ? "ar" : "fr";
  intlResponse?.headers.set("x-locale", locale);

  // Step 2: admin guard — protect /[locale]/admin/** except login
  const pathname = request.nextUrl.pathname;
  if (ADMIN_PATH.test(pathname) && !ADMIN_LOGIN.test(pathname)) {
    const response = intlResponse ?? NextResponse.next({ request });
    const { user } = await updateSession(request, response);
    if (!user) {
      // detect locale from URL
      const locale = pathname.startsWith("/ar") ? "ar" : "fr";
      return NextResponse.redirect(
        new URL(`/${locale}/admin/login`, request.url)
      );
    }
    return response;
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
