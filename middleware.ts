import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Expose the full URL to the app via header for UTM parsing on server
  res.headers.set("x-url", req.nextUrl.toString());

  // A/B variant persistence: query overrides cookie; otherwise randomly assign
  const queryVariant = (req.nextUrl.searchParams.get("variant") || "").toLowerCase();
  const cookieVariant = req.cookies.get("ab_variant")?.value;
  let variant: "a" | "b" | null = null;
  if (queryVariant === "a" || queryVariant === "b") {
    variant = queryVariant;
  } else if (cookieVariant === "a" || cookieVariant === "b") {
    variant = cookieVariant as "a" | "b";
  } else {
    variant = Math.random() < 0.5 ? "a" : "b";
  }
  if (variant && cookieVariant !== variant) {
    res.cookies.set("ab_variant", variant, { path: "/", maxAge: 60 * 24 * 3600 });
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};


