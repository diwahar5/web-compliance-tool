import { chromium, Page } from 'playwright';
import { Cookie } from 'playwright-core';

export interface RawScanData {
  cookies: Cookie[];
  scripts: { src: string }[];
  html: string;
}

// Function to try and accept common cookie banners
async function acceptCookieBanners(page: Page) {
  const selectors = [
    'button:has-text("Accept all")',
    'button:has-text("Accept")',
    'button:has-text("Allow all")',
    'button:has-text("Allow")',
    'button:has-text("I agree")',
    'button:has-text("OK")',
    '[id*="consent"]',
    '[class*="consent"]',
    '[id*="cookie"]',
    '[class*="cookie"]',
  ];

  for (const selector of selectors) {
    try {
      // Use page.locator which is the modern way to select elements
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click({ timeout: 2000 });
        console.log(`Clicked on a consent banner element: ${selector}`);
        // Wait a moment for the banner to disappear and cookies to be set
        await page.waitForTimeout(1000); 
        return; // Assume one banner is enough
      }
    } catch (e) {
      // Element not found, not visible, or not clickable, continue to the next
    }
  }
  console.log("No common cookie banners found to accept.");
}

export async function scanWebsite(url: string): Promise<RawScanData> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // Emulate a user agent to avoid simple bot detection
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    
    // Attempt to accept cookie banners to reveal all cookies and scripts
    await acceptCookieBanners(page);

    // Re-wait for network to be idle after potential banner interaction
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    const cookies = await context.cookies();
    const html = await page.content();

    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(script => ({
        src: (script as HTMLScriptElement).src
      }));
    });

    return { cookies, scripts, html };

  } finally {
    await browser.close();
  }
}
