import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer policy — don't leak full URL to third parties
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Force HTTPS in production (1 year)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Permissions policy — restrict powerful APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy — allow same-origin + inline scripts for Next.js hydration
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow inline scripts required by Next.js hydration
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Allow inline styles + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts + self for fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: same-origin + data URIs
              "img-src 'self' data: blob:",
              // API connections: same-origin only
              "connect-src 'self'",
              // No plugins, no objects
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // NOTE: X-Frame-Options intentionally omitted — Pivota preview uses iframe embedding
          // NOTE: X-XSS-Protection omitted (deprecated in modern browsers, CSP is the correct mitigation)
        ],
      },
    ];
  },
};

export default nextConfig;
