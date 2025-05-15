// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual regression tests for React Shopping Cart
 * These tests compare screenshots to detect visual changes
 */
test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for products to load
    await page.waitForSelector('.shelf-item');
  });

  test('TC-VR-001: Product List Visual Appearance', async ({ page }) => {
    // Take screenshot of the product list
    await expect(page.locator('.shelf-container')).toHaveScreenshot('product-list.png');
  });

  test('TC-VR-002: Filter Bar Visual Appearance', async ({ page }) => {
    // Take screenshot of the filter section
    await expect(page.locator('.filters')).toHaveScreenshot('filter-bar.png');
  });

  test('TC-VR-003: Empty Cart Visual Appearance', async ({ page }) => {
    // Open the cart
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    // Make sure cart is empty
    const cartItems = await page.$$('.cart-item');
    if (cartItems.length > 0) {
      // Remove all items
      for (let i = 0; i < cartItems.length; i++) {
        await page.click('.cart-item .remove-item');
        await page.waitForTimeout(500);
      }
    }
    
    // Take screenshot of empty cart
    await expect(page.locator('.float-cart--open')).toHaveScreenshot('empty-cart.png');
  });

  test('TC-VR-004: Cart with Items Visual Appearance', async ({ page }) => {
    // Add a product to the cart
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    
    // Open the cart
    if (!await page.$('.float-cart--open')) {
      await page.click('.float-cart__icon');
      await page.waitForSelector('.float-cart--open');
    }
    
    // Take screenshot of cart with item
    await expect(page.locator('.float-cart--open')).toHaveScreenshot('cart-with-items.png');
  });

  test('TC-VR-005: Mobile Responsive Layout', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Take screenshot of mobile product list
    await expect(page.locator('.shelf-container')).toHaveScreenshot('mobile-product-list.png');
    
    // Open cart on mobile
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    // Take screenshot of mobile cart
    await expect(page.locator('.float-cart--open')).toHaveScreenshot('mobile-cart.png');
  });

  test('TC-VR-006: Product Details Visual Consistency', async ({ page }) => {
    // Take screenshot of the first product
    await expect(page.locator('.shelf-item:nth-child(1)')).toHaveScreenshot('product-details.png');
  });

  test('TC-VR-007: Filter Selection Visual Effect', async ({ page }) => {
    // Click on a size filter
    await page.click('.filters-available-size input[value="M"] + label');
    await page.waitForTimeout(500);
    
    // Take screenshot of the selected filter
    await expect(page.locator('.filters-available-size')).toHaveScreenshot('selected-filter.png');
  });
});
