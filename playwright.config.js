// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for React Shopping Cart testing
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './test_scripts/playwright',
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met
     */
    timeout: 5000
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: './results/playwright/html-report' }],
    ['json', { outputFile: './results/playwright/test-results.json' }],
    ['junit', { outputFile: './results/playwright/junit-results.xml' }]
  ],
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        // Browser options
        browserName: 'chromium',
        // Context options
        viewport: { width: 1280, height: 720 },
        // Artifacts
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        // Record video only when retrying a test
        video: 'on-first-retry',
        
        // Test against local environment
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5'],
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        baseURL: 'http://localhost:3000',
      },
    },
  ],
  
  // Web server to run before starting the tests
  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start the server
  },
});
