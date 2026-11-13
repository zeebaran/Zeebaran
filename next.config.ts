import mediaAssets from "./features/media/assets.generated.json" with { type: "json" };
import type { NextConfig } from "next";
const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
const authEmulatorOrigin =
  emulator && /^127\.0\.0\.1:\d+$/.test(emulator) ? "http://" + emulator : "";
const dev = process.env.NODE_ENV !== "production";
const config: NextConfig = {
  distDir: process.env.ZEEBARAN_BUILD_DIR || ".next",
  allowedDevOrigins: ["192.168.1.8"],
  serverExternalPackages: ["pdf-lib"],
  outputFileTracingIncludes: {
    "/api/enquiries*": [
      "./scripts/validate-pdf.mjs",
      "./node_modules/pdf-lib/**/*",
      "./node_modules/@pdf-lib/**/*",
      "./node_modules/pako/**/*",
      "./node_modules/tslib/**/*",
    ],
  },
  poweredByHeader: false,
  devIndicators: false,
  images: {
    deviceSizes: [320, 390, 480, 640, 768, 960, 1152, 1440, 1920, 2400],
    formats: ["image/webp"],
    remotePatterns: process.env.CLOUDINARY_CLOUD_NAME
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: "/" + process.env.CLOUDINARY_CLOUD_NAME + "/image/upload/**",
          },
        ]
      : [],
  },
  async redirects() {
    return [
      { source: "/field-centres", destination: "/zeebaran-hub", permanent: true },
      ...Object.values(mediaAssets).map((asset) => ({
        source: encodeURI(asset.legacySource),
        destination: asset.src,
        permanent: true,
      })),
    ];
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-src 'self' https://www.youtube-nocookie.com https://*.firebaseapp.com https://accounts.google.com",
      "media-src 'self' https://res.cloudinary.com",
      `script-src 'self' 'unsafe-inline' ${dev ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://apis.google.com https://www.youtube.com`,
      "img-src 'self' data: blob: https://tile.openstreetmap.org https://res.cloudinary.com https://i.ytimg.com https://*.google-analytics.com https://*.googletagmanager.com",
      `connect-src 'self' ${authEmulatorOrigin} ${dev ? "ws://localhost:* ws://127.0.0.1:*" : ""} https://api.web3forms.com https://api.cloudinary.com https://res.cloudinary.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseapp.com https://storage.googleapis.com https://*.storage.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};
export default config;
