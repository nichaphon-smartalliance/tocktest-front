import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
] as const;

function clearSessionCookies(response: NextResponse) {
  for (const name of SESSION_COOKIES) {
    response.cookies.delete(name);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  let token: Awaited<ReturnType<typeof getToken>>;

  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch {
    return clearSessionCookies(
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }

  if (!token?.id) {
    const hasSessionCookie = SESSION_COOKIES.some((name) =>
      request.cookies.has(name),
    );
    const response = NextResponse.redirect(new URL("/login", request.url));
    return hasSessionCookie ? clearSessionCookies(response) : response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/repos/:path*", "/settings/:path*"],
};
