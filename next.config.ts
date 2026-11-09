import type { NextConfig } from "next";
const dev = process.env.NODE_ENV !== "production";
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: {
    deviceSizes: [320, 390, 480, 640, 768, 960, 1152, 1440, 1920, 2400],
    formats: ["image/webp"],
  },
  async redirects() {
    return [{ source: "/field-centres", destination: "/zeebaran-hub", permanent: true }];
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      `script-src 'self' 'unsafe-inline' ${dev ? "'unsafe-eval'" : ""} https://www.googletagmanager.com`,
      "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
      `connect-src 'self' ${dev ? "ws://localhost:* ws://127.0.0.1:*" : ""} https://storage.googleapis.com https://*.storage.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default config;
