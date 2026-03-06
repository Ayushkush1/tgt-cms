import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log(
    `Middleware executing for: ${request.nextUrl.pathname} from origin: ${request.headers.get("origin")}`,
  );

  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "https://tgt-landing-page-jade.vercel.app",
    "https://tgt-cms.vercel.app",
  ];

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const preflightResponse = new NextResponse(null, {
      status: 200,
    });

    if (origin && allowedOrigins.includes(origin)) {
      preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
    }

    preflightResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    preflightResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    return preflightResponse;
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
