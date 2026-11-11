import type { NextConfig } from "next";

// The website reads this CMS server-to-server only, so the API sends no CORS headers.
const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],
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
