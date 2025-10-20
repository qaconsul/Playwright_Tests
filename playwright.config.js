import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  // Increase timeout for the entire test
  timeout: 300000, // 5 minutes per test
  
  // Increase timeout for individual actions
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  
  use: {
    baseURL: 'http://automationexercise.com',
    trace: 'on-first-retry',
    //screenshot: 'only-on-failure',
    //video: 'retain-on-failure',
  },
  
  // webServer: {
  //   // Optional: if you have a local dev server
  //   url: 'http://127.0.0.1:3000',
  //   command: 'npm run start',
  //   reuseExistingServer: !process.env.CI,
  // },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
