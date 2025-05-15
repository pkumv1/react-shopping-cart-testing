// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Product Listing tests implementation using Playwright
 */
test.describe('Product Listing Component', () => {
  // Setup for each test - visit the app page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for products to load
    await page.waitForSelector('.shelf-item');
  });

  test('TC-PL-001: Display Product List', async ({ page }) => {
    // Verify product list is displayed
    const products = await page.$$('.shelf-item');
    expect(products.length).toBeGreaterThan(0);
    
    // Check first product has all expected elements
    const firstProduct = products[0];
    
    // Verify product has an image
    const image = await firstProduct.$('.shelf-item__thumb img');
    expect(image).not.toBeNull();
    
    // Verify product has a name
    const title = await firstProduct.$('.shelf-item__title');
    expect(title).not.toBeNull();
    
    // Verify product has a price
    const price = await firstProduct.$('.shelf-item__price');
    expect(price).not.toBeNull();
    
    // Verify product has an "Add to cart" button
    const addToCartButton = await firstProduct.$('.shelf-item__buy-btn');
    expect(addToCartButton).not.toBeNull();
    
    // Get product count to verify all products loaded
    const productCount = await page.$$eval('.shelf-item', items => items.length);
    console.log(`Found ${productCount} products on the page`);
  });

  test('TC-PL-002: Filter Products by Size', async ({ page }) => {
    // Get initial product count
    const initialProductCount = await page.$$eval('.shelf-item', items => items.length);
    
    // Click on a size filter (e.g., "M")
    await page.click('.filters-available-size input[value="M"] + label');
    
    // Wait for products to update
    await page.waitForTimeout(500);
    
    // Get filtered product count
    const filteredProductCount = await page.$$eval('.shelf-item', items => items.length);
    
    // Verify filter was applied (count should be different)
    expect(filteredProductCount).toBeLessThanOrEqual(initialProductCount);
    
    // Verify only products with size "M" are displayed
    const productSizes = await page.$$eval('.shelf-item', items => {
      return items.map(item => {
        const availableSizes = Array.from(item.querySelectorAll('.shelf-stopper span'));
        return availableSizes.map(size => size.textContent);
      });
    });
    
    // Check all displayed products have the "M" size
    for (const sizes of productSizes) {
      expect(sizes).toContain('M');
    }
    
    // Click on the same filter to remove it
    await page.click('.filters-available-size input[value="M"] + label');
    
    // Wait for products to update
    await page.waitForTimeout(500);
    
    // Verify original products are restored
    const restoredProductCount = await page.$$eval('.shelf-item', items => items.length);
    expect(restoredProductCount).toEqual(initialProductCount);
  });

  test('TC-PL-003: Sort Products by Price', async ({ page }) => {
    // Select "Lowest to highest" sort option
    await page.selectOption('.sort select', 'lowestprice');
    
    // Wait for products to reorder
    await page.waitForTimeout(500);
    
    // Get all product prices
    const ascPrices = await page.$$eval('.shelf-item__price', items => {
      return items.map(item => {
        // Remove currency symbol and convert to number
        return parseFloat(item.textContent.replace(/[^0-9.-]+/g, ''));
      });
    });
    
    // Check prices are in ascending order
    for (let i = 0; i < ascPrices.length - 1; i++) {
      expect(ascPrices[i]).toBeLessThanOrEqual(ascPrices[i + 1]);
    }
    
    // Select "Highest to lowest" sort option
    await page.selectOption('.sort select', 'highestprice');
    
    // Wait for products to reorder
    await page.waitForTimeout(500);
    
    // Get all product prices
    const descPrices = await page.$$eval('.shelf-item__price', items => {
      return items.map(item => {
        // Remove currency symbol and convert to number
        return parseFloat(item.textContent.replace(/[^0-9.-]+/g, ''));
      });
    });
    
    // Check prices are in descending order
    for (let i = 0; i < descPrices.length - 1; i++) {
      expect(descPrices[i]).toBeGreaterThanOrEqual(descPrices[i + 1]);
    }
  });

  test('TC-PL-004: Empty Product List Handling', async ({ page }) => {
    // Apply a combination of size filters that no product matches
    // For example, select "XS" and "XXL" (assuming no product has both sizes)
    await page.click('.filters-available-size input[value="XS"] + label');
    await page.click('.filters-available-size input[value="XXL"] + label');
    
    // Wait for products to update
    await page.waitForTimeout(500);
    
    // Check if no products are displayed or if there's a "no products" message
    const products = await page.$$('.shelf-item');
    
    if (products.length === 0) {
      // No products case - check for empty message if implemented
      const emptyMessage = await page.$('.shelf-empty');
      if (emptyMessage) {
        expect(await emptyMessage.textContent()).toContain('No products');
      }
    } else {
      // If products are shown, verify they have both XS and XXL sizes
      const productSizes = await page.$$eval('.shelf-item', items => {
        return items.map(item => {
          const availableSizes = Array.from(item.querySelectorAll('.shelf-stopper span'));
          return availableSizes.map(size => size.textContent);
        });
      });
      
      for (const sizes of productSizes) {
        expect(sizes).toContain('XS');
        expect(sizes).toContain('XXL');
      }
    }
  });

  test('TC-PL-005: Product Information Accuracy', async ({ page }) => {
    // Get the product data
    const productInfo = await page.$$eval('.shelf-item', items => {
      return items.map(item => {
        return {
          title: item.querySelector('.shelf-item__title')?.textContent,
          price: item.querySelector('.shelf-item__price')?.textContent,
          imgSrc: item.querySelector('.shelf-item__thumb img')?.getAttribute('src')
        };
      });
    });
    
    // Verify each product has valid information
    for (const product of productInfo) {
      expect(product.title).toBeTruthy();
      expect(product.price).toBeTruthy();
      expect(product.imgSrc).toBeTruthy();
      
      // Check price format
      expect(product.price).toMatch(/\$\d+\.\d{2}/);
      
      // Check image loads correctly
      const img = await page.$(`img[src="${product.imgSrc}"]`);
      expect(img).not.toBeNull();
    }
  });

  test('TC-PL-006: Responsive Layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    const desktopColumns = await page.evaluate(() => {
      const firstItem = document.querySelector('.shelf-item');
      if (!firstItem) return 0;
      const itemStyle = window.getComputedStyle(firstItem);
      // This will need to be adjusted based on actual CSS implementation
      const itemWidth = parseFloat(itemStyle.width);
      const containerWidth = parseFloat(window.getComputedStyle(document.querySelector('.shelf-container')).width);
      return Math.floor(containerWidth / itemWidth);
    });
    
    expect(desktopColumns).toBeGreaterThan(1);
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const tabletColumns = await page.evaluate(() => {
      const firstItem = document.querySelector('.shelf-item');
      if (!firstItem) return 0;
      const itemStyle = window.getComputedStyle(firstItem);
      const itemWidth = parseFloat(itemStyle.width);
      const containerWidth = parseFloat(window.getComputedStyle(document.querySelector('.shelf-container')).width);
      return Math.floor(containerWidth / itemWidth);
    });
    
    expect(tabletColumns).toBeLessThanOrEqual(desktopColumns);
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileColumns = await page.evaluate(() => {
      const firstItem = document.querySelector('.shelf-item');
      if (!firstItem) return 0;
      const itemStyle = window.getComputedStyle(firstItem);
      const itemWidth = parseFloat(itemStyle.width);
      const containerWidth = parseFloat(window.getComputedStyle(document.querySelector('.shelf-container')).width);
      return Math.floor(containerWidth / itemWidth);
    });
    
    expect(mobileColumns).toBeLessThanOrEqual(tabletColumns);
  });

  test('TC-PL-101: Product Listing Accessibility', async ({ page }) => {
    // Load axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
    });
    
    // Run accessibility audit
    const violations = await page.evaluate(async () => {
      return await new Promise(resolve => {
        window.axe.run(
          document.body,
          { 
            runOnly: { 
              type: 'tag', 
              values: ['wcag2a', 'wcag2aa'] 
            } 
          },
          (err, results) => {
            if (err) throw err;
            resolve(results.violations);
          }
        );
      });
    });
    
    // Log violations for analysis
    if (violations.length > 0) {
      console.log('Accessibility violations:', violations);
    }
    
    // Check for critical issues
    const criticalIssues = violations.filter(v => v.impact === 'critical');
    expect(criticalIssues.length).toBe(0);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus on first interactive element
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return {
        tagName: element.tagName,
        isVisible: window.getComputedStyle(element).outline !== 'none' || 
                  window.getComputedStyle(element).boxShadow !== 'none'
      };
    });
    
    expect(focusedElement.tagName).not.toBe('BODY'); // Focus should move to an element
    expect(focusedElement.isVisible).toBe(true); // Focus should be visible
  });

  test('TC-PL-201: Product Data Validation', async ({ page }) => {
    // Intercept API requests
    await page.route('**/*.json', route => route.continue());
    
    // Check XSS protection
    const potentialXssContent = await page.evaluate(() => {
      // Look for any user-generated content or dynamic text
      const textElements = document.querySelectorAll('.shelf-item__title, .shelf-item__price');
      
      for (const element of textElements) {
        if (element.innerHTML.includes('<script>') || 
            element.innerHTML.includes('javascript:') ||
            element.innerHTML.includes('onerror=')) {
          return true;
        }
      }
      
      return false;
    });
    
    expect(potentialXssContent).toBe(false);
    
    // Check image URLs are safe
    const imgSources = await page.$$eval('img', imgs => imgs.map(img => img.src));
    
    for (const src of imgSources) {
      expect(src).not.toContain('javascript:');
      expect(src).not.toContain('data:text/html');
    }
  });

  test('TC-PL-301: Product Listing Performance', async ({ page }) => {
    // Measure time to load products
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    const loadTime = Date.now() - startTime;
    console.log(`Time to load products: ${loadTime}ms`);
    
    // Verify load time is acceptable (e.g., < 3 seconds)
    expect(loadTime).toBeLessThan(3000);
    
    // Measure filter operation performance
    const filterStartTime = Date.now();
    
    await page.click('.filters-available-size input[value="M"] + label');
    await page.waitForTimeout(500); // Wait for filtering to complete
    
    const filterTime = Date.now() - filterStartTime;
    console.log(`Time to filter products: ${filterTime}ms`);
    
    // Verify filter time is acceptable (e.g., < 1 second)
    expect(filterTime).toBeLessThan(1000);
    
    // Measure sort operation performance
    const sortStartTime = Date.now();
    
    await page.selectOption('.sort select', 'lowestprice');
    await page.waitForTimeout(500); // Wait for sorting to complete
    
    const sortTime = Date.now() - sortStartTime;
    console.log(`Time to sort products: ${sortTime}ms`);
    
    // Verify sort time is acceptable (e.g., < 1 second)
    expect(sortTime).toBeLessThan(1000);
  });
});