import { defineConfig } from "@playwright/test";
import path from "node:path";
import { tmpdir } from "node:os";
const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3274";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 2,
  timeout: 90000,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    {
      name: "firefox",
      use: {
        browserName: "firefox",
        launchOptions: { executablePath: process.env.E2E_FIREFOX_EXECUTABLE },
      },
    },
    { name: "webkit", use: { browserName: "webkit" } },
    ...(process.env.E2E_CHROME
      ? [{ name: "chrome", use: { browserName: "chromium" as const, channel: "chrome" } }]
      : []),
    ...(process.env.E2E_EDGE_EXECUTABLE
      ? [
          {
            name: "edge",
            use: {
              browserName: "chromium" as const,
              launchOptions: { executablePath: process.env.E2E_EDGE_EXECUTABLE },
            },
          },
        ]
      : []),
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run start -- --hostname 127.0.0.1 --port 3274",
        url: baseURL,
        reuseExistingServer: false,
        env: {
          ZEEBARAN_LOCAL_INBOX: "1",
          ZEEBARAN_INBOX_DIR: path.join(tmpdir(), "zeebaran-e2e-" + process.pid),
          FIREBASE_PROJECT_ID: "",
          FIREBASE_STORAGE_BUCKET: "",
        },
      },
});
