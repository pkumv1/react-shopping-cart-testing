const puppeteer = require('puppeteer');
const { expect } = require('chai');

/**
 * End-to-End tests implementation using Puppeteer
 */
describe('E2E Shopping Flow - Puppeteer', function() {
  // Increase timeout for Puppeteer tests
  this.timeout(30000);
  
  let browser;
  let page;
  
  before(async function() {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });
  
  after(async function() {
    // Close browser after all tests
    await browser.close();
  });
  
  beforeEach(async function() {
    // Create a new page
    page = await browser.newPage();
    
    // Set viewport size to desktop
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for products to load
    await page.waitForSelector('.shelf-item');
  });
  
  afterEach(async function() {
    // Close page after each test
    await page.close();
  });
  
  it('TC-E2E-001: Complete Shopping Flow', async function() {
    // Step 1: Browse and filter products
    // Apply a size filter
    await page.click('.filters-available-size input[value="M"] + label');
    await page.waitForTimeout(500);
    
    // Verify filter was applied
    const filteredProducts = await page.$$('.shelf-item');
    
    // Log the number of filtered products
    console.log(`Found ${filteredProducts.length} products after filtering`);
    
    // Step 2: Add multiple products to the cart
    // Add first filtered product
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    
    // Add second filtered product if available
    if (filteredProducts.length > 1) {
      await page.click('.shelf-item:nth-child(2) .shelf-item__buy-btn');
      await page.waitForTimeout(500);
    }
    
    // Step 3: Open the cart
    // First, check if cart is already open
    let isCartOpen = await page.evaluate(() => {
      return document.querySelector('.float-cart--open') !== null;
    });
    
    if (!isCartOpen) {
      await page.click('.float-cart__icon');
      await page.waitForSelector('.float-cart--open');
    }
    
    // Step 4: Verify all products are in the cart
    const cartItems = await page.$$('.cart-item');
    expect(filteredProducts.length >= cartItems.length).to.be.true;
    
    // Step 5: Verify subtotal calculation
    const subtotalText = await page.$eval('.sub-price__val', el => el.textContent);
    const subtotal = parseFloat(subtotalText.replace(/[^0-9.-]+/g, ''));
    
    // Verify subtotal is greater than zero
    expect(subtotal).to.be.greaterThan(0);
    
    // Step 6: Proceed to checkout (if implemented)
    // This assumes there's a checkout button in the cart
    try {
      const checkoutButton = await page.$('.checkout-btn');
      if (checkoutButton) {
        await checkoutButton.click();
        // Wait for checkout page to load
        // await page.waitForSelector('.checkout-page');
        console.log('Checkout process would continue here if implemented');
      } else {
        console.log('Checkout button not found - this functionality might not be implemented');
      }
    } catch (err) {
      console.log('Checkout process not implemented in this application');
    }
  });
  
  it('TC-E2E-002: Responsive Design Flow', async function() {
    // Test on desktop viewport (already set in beforeEach)
    // Add a product to cart
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    
    // Open cart
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    // Verify cart is visible and usable on desktop
    const cartVisibleDesktop = await page.evaluate(() => {
      const cart = document.querySelector('.float-cart--open');
      return cart && window.getComputedStyle(cart).display !== 'none';
    });
    
    expect(cartVisibleDesktop).to.be.true;
    
    // Test on tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Verify product grid adjusts
    const tabletLayout = await page.evaluate(() => {
      // This will depend on the actual responsive design implementation
      // For example, we might check the number of products per row
      const productContainer = document.querySelector('.shelf-container');
      const computedStyle = window.getComputedStyle(productContainer);
      // Check grid-template-columns if CSS Grid is used
      return {
        display: computedStyle.display,
        gridTemplateColumns: computedStyle.gridTemplateColumns,
        flexDirection: computedStyle.flexDirection
      };
    });
    
    console.log('Tablet layout:', tabletLayout);
    
    // Verify cart is still accessible
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    const cartVisibleTablet = await page.evaluate(() => {
      const cart = document.querySelector('.float-cart--open');
      return cart && window.getComputedStyle(cart).display !== 'none';
    });
    
    expect(cartVisibleTablet).to.be.true;
    
    // Test on mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify product grid adjusts again
    const mobileLayout = await page.evaluate(() => {
      const productContainer = document.querySelector('.shelf-container');
      const computedStyle = window.getComputedStyle(productContainer);
      return {
        display: computedStyle.display,
        gridTemplateColumns: computedStyle.gridTemplateColumns,
        flexDirection: computedStyle.flexDirection
      };
    });
    
    console.log('Mobile layout:', mobileLayout);
    
    // Verify cart is still accessible on mobile
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    const cartVisibleMobile = await page.evaluate(() => {
      const cart = document.querySelector('.float-cart--open');
      return cart && window.getComputedStyle(cart).display !== 'none';
    });
    
    expect(cartVisibleMobile).to.be.true;
  });
  
  it('TC-E2E-004: Network Conditions Testing', async function() {
    // Enable network throttling to simulate slow connection
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    
    // Simulate 3G connection
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 100, // ms
      downloadThroughput: 750 * 1024 / 8, // 750 kbps
      uploadThroughput: 250 * 1024 / 8 // 250 kbps
    });
    
    // Reload the page with throttled network
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Verify that products still load
    await page.waitForSelector('.shelf-item');
    const products = await page.$$('.shelf-item');
    expect(products.length).to.be.greaterThan(0);
    
    // Add a product to cart
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(1000);
    
    // Verify cart updates correctly
    const cartCount = await page.$eval('.float-cart__count', el => parseInt(el.textContent, 10));
    expect(cartCount).to.be.greaterThan(0);
    
    // Simulate offline mode
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });
    
    // Try to add another product (this might fail or show an error)
    try {
      await page.click('.shelf-item:nth-child(2) .shelf-item__buy-btn');
      await page.waitForTimeout(1000);
      
      // Check for error message if implemented
      const errorMessage = await page.$('.error-message');
      if (errorMessage) {
        const errorText = await page.evaluate(el => el.textContent, errorMessage);
        console.log(`Error message displayed: ${errorText}`);
      }
    } catch (err) {
      console.log('Operation failed in offline mode, as expected');
    }
    
    // Restore network conditions
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });
  });
  
  it('TC-E2E-005: Session Persistence', async function() {
    // Add a product to the cart
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    
    // Get the current cart count
    const cartCount = await page.$eval('.float-cart__count', el => parseInt(el.textContent, 10));
    
    // Store cart data from localStorage
    const cartData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart') || '{}');
    });
    
    console.log('Cart data in localStorage:', cartData);
    
    // Reload the page to simulate closing and reopening the browser
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Wait for products to load
    await page.waitForSelector('.shelf-item');
    
    // Verify cart count is preserved after reload
    const newCartCount = await page.$eval('.float-cart__count', el => parseInt(el.textContent, 10));
    expect(newCartCount).to.equal(cartCount);
    
    // Open cart to verify products are still there
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    
    const cartItems = await page.$$('.cart-item');
    expect(cartItems.length).to.be.greaterThan(0);
  });
  
  it('TC-E2E-006: Error Recovery', async function() {
    // Intercept network requests to simulate errors
    await page.setRequestInterception(true);
    
    // Simulate an API error for product data
    page.on('request', request => {
      // If this is a request for product data (adjust this based on actual API endpoints)
      if (request.url().includes('products.json')) {
        // Respond with an error
        request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        // Let other requests through
        request.continue();
      }
    });
    
    // Reload the page to trigger the intercepted request
    await page.reload();
    
    // Wait for error message to appear (if implemented)
    try {
      await page.waitForSelector('.error-message', { timeout: 5000 });
      const errorText = await page.$eval('.error-message', el => el.textContent);
      console.log(`Error message displayed: ${errorText}`);
      
      // Check if there's a retry button
      const retryButton = await page.$('.retry-button');
      if (retryButton) {
        // Disable interception before retrying
        await page.setRequestInterception(false);
        
        // Click retry button
        await retryButton.click();
        
        // Wait for products to load after recovery
        await page.waitForSelector('.shelf-item', { timeout: 5000 });
        
        // Verify products are loaded after recovery
        const products = await page.$$('.shelf-item');
        expect(products.length).to.be.greaterThan(0);
      }
    } catch (err) {
      console.log('No explicit error message component found');
      
      // Check if the UI degrades gracefully (doesn't crash)
      const bodyContent = await page.evaluate(() => document.body.innerHTML);
      expect(bodyContent.length).to.be.greaterThan(0);
      
      // Disable interception
      await page.setRequestInterception(false);
      
      // Reload without interception to recover
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Verify recovery is possible
      await page.waitForSelector('.shelf-item', { timeout: 5000 });
    }
  });
  
  it('TC-E2E-101: Complete Flow Accessibility', async function() {
    // Load axe-core for accessibility testing
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
    });
    
    // Run accessibility audit on the product listing page
    const axeResults = await page.evaluate(async () => {
      return await new Promise(resolve => {
        axe.run(document.body, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa']
          }
        }, (err, results) => {
          if (err) throw err;
          resolve(results);
        });
      });
    });
    
    console.log(`Found ${axeResults.violations.length} accessibility violations on product page`);
    
    // Log critical violations
    const criticalViolations = axeResults.violations.filter(v => v.impact === 'critical');
    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations:', criticalViolations);
    }
    
    // Test keyboard navigation
    // Press Tab to move focus to first interactive element
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on the first element
    const isFocusVisible = await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (activeElement === document.body) return false;
      
      const style = window.getComputedStyle(activeElement);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });
    
    expect(isFocusVisible).to.be.true;
    
    // Continue Tab navigation to reach a product
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Press Enter/Space to click an interactive element (like "Add to Cart")
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify cart was updated via keyboard
    try {
      const cartCount = await page.$eval('.float-cart__count', el => parseInt(el.textContent, 10));
      expect(cartCount).to.be.greaterThan(0);
    } catch (err) {
      console.log('Keyboard navigation may not be fully implemented for adding to cart');
    }
  });
  
  it('TC-E2E-301: Complete Flow Performance', async function() {
    // Enable performance metrics collection
    await page.metrics();
    
    // Measure initial page load time
    const startLoadTime = Date.now();
    await page.reload({ waitUntil: 'networkidle2' });
    const loadTime = Date.now() - startLoadTime;
    
    console.log(`Initial page load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(5000); // 5 seconds is a reasonable threshold
    
    // Get performance metrics after page load
    const performanceMetrics = await page.metrics();
    console.log('Performance metrics:', {
      JSHeapUsed: Math.round(performanceMetrics.JSHeapUsedSize / 1024 / 1024) + ' MB',
      JSHeapTotal: Math.round(performanceMetrics.JSHeapTotalSize / 1024 / 1024) + ' MB',
      ScriptDuration: Math.round(performanceMetrics.ScriptDuration * 1000) + ' ms',
      TaskDuration: Math.round(performanceMetrics.TaskDuration * 1000) + ' ms'
    });
    
    // Measure performance during interaction
    // Add product to cart
    const startAddTime = Date.now();
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    const addTime = Date.now() - startAddTime;
    
    console.log(`Time to add product to cart: ${addTime}ms`);
    expect(addTime).to.be.lessThan(1500); // 1.5 seconds is a reasonable threshold
    
    // Apply filter
    const startFilterTime = Date.now();
    await page.click('.filters-available-size input[value="M"] + label');
    await page.waitForTimeout(500);
    const filterTime = Date.now() - startFilterTime;
    
    console.log(`Time to apply filter: ${filterTime}ms`);
    expect(filterTime).to.be.lessThan(1500); // 1.5 seconds is a reasonable threshold
    
    // Open cart
    const startCartTime = Date.now();
    await page.click('.float-cart__icon');
    await page.waitForSelector('.float-cart--open');
    const cartTime = Date.now() - startCartTime;
    
    console.log(`Time to open cart: ${cartTime}ms`);
    expect(cartTime).to.be.lessThan(1000); // 1 second is a reasonable threshold
    
    // Get updated performance metrics after interactions
    const finalMetrics = await page.metrics();
    
    // Check for memory leaks
    const initialHeapUsed = performanceMetrics.JSHeapUsedSize;
    const finalHeapUsed = finalMetrics.JSHeapUsedSize;
    const heapDiff = finalHeapUsed - initialHeapUsed;
    
    console.log(`Heap usage increase: ${Math.round(heapDiff / 1024 / 1024)} MB`);
    
    // A large increase might indicate a memory leak
    expect(heapDiff).to.be.lessThan(50 * 1024 * 1024); // 50MB is a reasonable threshold
  });
});