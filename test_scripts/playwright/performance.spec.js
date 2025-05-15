// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Performance tests for React Shopping Cart
 * These tests measure loading times and interaction performance
 */
test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance metrics
    await page.evaluate(() => {
      window.performanceMetrics = {
        marks: {},
        measures: {}
      };
      
      // Monkey patch performance API to store metrics
      const originalMark = performance.mark;
      performance.mark = function(name) {
        window.performanceMetrics.marks[name] = Date.now();
        return originalMark.apply(this, arguments);
      };
      
      const originalMeasure = performance.measure;
      performance.measure = function(name, startMark, endMark) {
        const result = originalMeasure.apply(this, arguments);
        
        const start = window.performanceMetrics.marks[startMark];
        const end = window.performanceMetrics.marks[endMark];
        
        if (start && end) {
          window.performanceMetrics.measures[name] = end - start;
        }
        
        return result;
      };
    });
  });
  
  test('TC-PERF-001: Initial Page Load Performance', async ({ page }) => {
    // Measure initial page load time
    await page.evaluate(() => {
      performance.mark('pageLoadStart');
    });
    
    await page.goto('http://localhost:3000');
    
    // Wait for products to load
    await page.waitForSelector('.shelf-item');
    
    await page.evaluate(() => {
      performance.mark('pageLoadEnd');
      performance.measure('pageLoadDuration', 'pageLoadStart', 'pageLoadEnd');
    });
    
    // Get the load time
    const loadTime = await page.evaluate(() => window.performanceMetrics.measures['pageLoadDuration']);
    
    console.log(`Initial page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 3 seconds is a reasonable threshold
    
    // Get the number of resources loaded
    const resourcesCount = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource').length;
    });
    
    console.log(`Number of resources loaded: ${resourcesCount}`);
    
    // Get JS heap size
    const jsHeapSize = await page.evaluate(() => {
      return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
    });
    
    if (jsHeapSize) {
      console.log(`JS heap size: ${Math.round(jsHeapSize / (1024 * 1024))} MB`);
    }
  });
  
  test('TC-PERF-002: Product Filtering Performance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    // Measure filtering performance
    await page.evaluate(() => {
      performance.mark('filterStart');
    });
    
    // Apply a size filter
    await page.click('.filters-available-size input[value="M"] + label');
    
    // Wait for filtering to complete
    await page.waitForTimeout(500);
    
    await page.evaluate(() => {
      performance.mark('filterEnd');
      performance.measure('filterDuration', 'filterStart', 'filterEnd');
    });
    
    // Get the filter time
    const filterTime = await page.evaluate(() => window.performanceMetrics.measures['filterDuration']);
    
    console.log(`Filter operation time: ${filterTime}ms`);
    expect(filterTime).toBeLessThan(1000); // 1 second is a reasonable threshold
  });
  
  test('TC-PERF-003: Add to Cart Performance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    // Measure add to cart performance
    await page.evaluate(() => {
      performance.mark('addToCartStart');
    });
    
    // Add product to cart
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    
    // Wait for cart animation to complete
    await page.waitForTimeout(500);
    
    await page.evaluate(() => {
      performance.mark('addToCartEnd');
      performance.measure('addToCartDuration', 'addToCartStart', 'addToCartEnd');
    });
    
    // Get the add to cart time
    const addToCartTime = await page.evaluate(() => window.performanceMetrics.measures['addToCartDuration']);
    
    console.log(`Add to cart operation time: ${addToCartTime}ms`);
    expect(addToCartTime).toBeLessThan(1000); // 1 second is a reasonable threshold
  });
  
  test('TC-PERF-004: Cart Open/Close Performance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    // Add product to cart first
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    
    // Measure cart open performance
    await page.evaluate(() => {
      performance.mark('cartOpenStart');
    });
    
    // Open the cart
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    await page.evaluate(() => {
      performance.mark('cartOpenEnd');
      performance.measure('cartOpenDuration', 'cartOpenStart', 'cartOpenEnd');
    });
    
    // Get the cart open time
    const cartOpenTime = await page.evaluate(() => window.performanceMetrics.measures['cartOpenDuration']);
    
    console.log(`Cart open operation time: ${cartOpenTime}ms`);
    expect(cartOpenTime).toBeLessThan(500); // 500ms is a reasonable threshold
    
    // Measure cart close performance
    await page.evaluate(() => {
      performance.mark('cartCloseStart');
    });
    
    // Close the cart
    await page.click('.float-cart__close-btn');
    // Wait for the cart to close
    await page.waitForFunction(() => !document.querySelector('.float-cart--open'));
    
    await page.evaluate(() => {
      performance.mark('cartCloseEnd');
      performance.measure('cartCloseDuration', 'cartCloseStart', 'cartCloseEnd');
    });
    
    // Get the cart close time
    const cartCloseTime = await page.evaluate(() => window.performanceMetrics.measures['cartCloseDuration']);
    
    console.log(`Cart close operation time: ${cartCloseTime}ms`);
    expect(cartCloseTime).toBeLessThan(500); // 500ms is a reasonable threshold
  });
  
  test('TC-PERF-005: Memory Usage Under Load', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    // Get initial JS heap size
    const initialHeapSize = await page.evaluate(() => {
      return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
    });
    
    if (!initialHeapSize) {
      console.log('Memory API not available in this browser');
      test.skip();
      return;
    }
    
    console.log(`Initial JS heap size: ${Math.round(initialHeapSize / (1024 * 1024))} MB`);
    
    // Perform intensive operations
    // Add and remove products from cart multiple times
    for (let i = 0; i < 10; i++) {
      // Add product
      await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
      await page.waitForTimeout(200);
      
      // Open cart
      await page.click('.float-cart__icon');
      await page.waitForSelector('.float-cart--open');
      
      // Remove product
      await page.click('.cart-item .remove-item');
      await page.waitForTimeout(200);
      
      // Close cart
      await page.click('.float-cart__close-btn');
      await page.waitForFunction(() => !document.querySelector('.float-cart--open'));
    }
    
    // Get final JS heap size
    const finalHeapSize = await page.evaluate(() => {
      return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
    });
    
    console.log(`Final JS heap size: ${Math.round(finalHeapSize / (1024 * 1024))} MB`);
    console.log(`Memory increase: ${Math.round((finalHeapSize - initialHeapSize) / (1024 * 1024))} MB`);
    
    // Memory increase should be reasonable
    expect(finalHeapSize - initialHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB is a reasonable threshold
  });
});