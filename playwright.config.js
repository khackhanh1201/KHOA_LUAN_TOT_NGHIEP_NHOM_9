// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/** Chế độ xem: 1 tab, chậm, không song song — bật bằng E2E_WATCH=1 hoặc --project=chromium-watch */
const isWatchMode = process.env.E2E_WATCH === '1';
const slowMo = Number(process.env.E2E_SLOW_MO || (isWatchMode ? 400 : 0));

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /** Luồng serial (workflow/exceptions/security) — 1 worker, không chạy song song file */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  /** Mặc định 120s/test — local BE + webhook đôi khi chậm */
  timeout: 120_000,
  expect: { timeout: 30_000 },
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    actionTimeout: 60_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
  },

  /* Configure projects for major browsers */
  projects: [
    /** Tạo playwright/.auth/*.json — chạy trước các test flow theo role */
    {
      name: 'setup-auth',
      testMatch: /auth\.setup\.ts/,
    },

    {
      name: 'chromium',
      timeout: 300_000,
      use: { ...devices['Desktop Chrome'] },
    },

    /** Một Chrome, chậm, headed — dùng: npm run test:e2e:headed */
    {
      name: 'chromium-watch',
      timeout: 360_000,
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: { slowMo: slowMo || 400 },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

