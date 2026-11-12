import type { NextConfig } from "next";

// The website reads this CMS server-to-server only, so the API sends no CORS headers.
const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],
  // sharp's native binary links to libvips at runtime, but the build trace misses that
  // shared library, so on Vercel `import sharp` crashes the route. Ship it explicitly.
  outputFileTracingIncludes: {
    "/api/upload": ["./node_modules/@img/sharp-libvips-*/lib/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
