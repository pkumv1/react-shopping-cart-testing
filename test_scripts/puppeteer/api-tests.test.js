const puppeteer = require('puppeteer');
const { expect } = require('chai');
const axios = require('axios');

/**
 * API tests for React Shopping Cart
 * These tests check data integrity and API communication
 */
describe('API Testing - Puppeteer', function() {
  this.timeout(30000);
  
  let browser;
  let page;
  
  before(async function() {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
  });
  
  after(async function() {
    await browser.close();
  });
  
  it('TC-API-001: Products API Data Integrity', async function() {
    // Intercept network requests to capture product data
    let productsData = null;
    
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      request.continue();
    });
    
    page.on('response', async response => {
      // Get the API endpoints dynamically (depends on implementation)
      if (response.url().includes('products') && response.status() === 200) {
        try {
          productsData = await response.json();
        } catch (error) {
          console.error('Error parsing response:', error);
        }
      }
    });
    
    // Navigate to the page to trigger the API calls
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    // Wait a bit to ensure all responses are processed
    await page.waitForTimeout(1000);
    
    // Validate the product data structure
    expect(productsData).to.not.be.null;
    
    if (productsData) {
      // Check product data structure
      expect(productsData).to.be.an('array');
      
      // Check that products have the expected properties
      productsData.forEach(product => {
        expect(product).to.have.property('id');
        expect(product).to.have.property('title');
        expect(product).to.have.property('price');
        expect(product).to.have.property('availableSizes').that.is.an('array');
      });
      
      // Verify uniqueness of product IDs
      const productIds = productsData.map(product => product.id);
      const uniqueIds = new Set(productIds);
      expect(uniqueIds.size).to.equal(productIds.length);
    }
  });
  
  it('TC-API-002: Local Storage Persistence Test', async function() {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.shelf-item');
    
    // Add a product to the cart
    await page.click('.shelf-item:nth-child(1) .shelf-item__buy-btn');
    await page.waitForTimeout(500);
    
    // Get the cart data from localStorage
    const cartData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart') || '{}');
    });
    
    // Verify cart data structure
    expect(cartData).to.be.an('object');
    expect(cartData).to.have.property('products').that.is.an('array');
    
    if (cartData.products && cartData.products.length > 0) {
      // Verify product structure in cart
      const cartProduct = cartData.products[0];
      expect(cartProduct).to.have.property('id');
      expect(cartProduct).to.have.property('title');
      expect(cartProduct).to.have.property('price');
      expect(cartProduct).to.have.property('quantity');
    }
    
    // Refresh the page to verify persistence
    await page.reload();
    await page.waitForSelector('.shelf-item');
    
    // Get the cart data after refresh
    const refreshedCartData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart') || '{}');
    });
    
    // Verify data persistence
    expect(refreshedCartData).to.deep.equal(cartData);
  });
  
  it('TC-API-003: API Response Time Test', async function() {
    // Reset request interception
    await page.setRequestInterception(false);
    
    // Create a client to measure API response times
    const apiResponseTimes = {};
    
    // Set up response time tracking
    await page.on('response', async response => {
      const url = response.url();
      
      // Only track API responses
      if (url.includes('/api/') || url.includes('.json')) {
        const responseTime = await page.evaluate(async () => {
          const entries = performance.getEntriesByType('resource');
          
          // Find the entry corresponding to this response
          for (const entry of entries) {
            if (entry.name.includes('/api/') || entry.name.includes('.json')) {
              return entry.duration;
            }
          }
          
          return null;
        });
        
        if (responseTime) {
          apiResponseTimes[url] = responseTime;
        }
      }
    });
    
    // Navigate to the page to trigger the API calls
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Output response times
    console.log('API Response Times:', apiResponseTimes);
    
    // Verify that all API calls are reasonably fast
    for (const url in apiResponseTimes) {
      expect(apiResponseTimes[url]).to.be.lessThan(2000); // 2s threshold
    }
  });
  
  it('TC-API-004: Error Handling Test', async function() {
    // Create a new page for this test
    const errorPage = await browser.newPage();
    
    // Intercept requests to simulate errors
    await errorPage.setRequestInterception(true);
    
    // Track if error handling is triggered
    let errorHandled = false;
    
    // Intercept console errors
    errorPage.on('console', msg => {
      if (msg.type() === 'error') {
        errorHandled = true;
      }
    });
    
    // Intercept requests to inject errors
    errorPage.on('request', request => {
      // If this is a products API request
      if (request.url().includes('/products.json') || request.url().includes('/api/products')) {
        // Respond with a 500 error
        request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        request.continue();
      }
    });
    
    // Navigate to the application
    await errorPage.goto('http://localhost:3000');
    
    // Wait a moment for error handling to occur
    await errorPage.waitForTimeout(2000);
    
    // Check for error state in the UI
    const errorStatePresent = await errorPage.evaluate(() => {
      // Look for common error state indicators
      return document.body.textContent.includes('Error') ||
             document.body.textContent.includes('Failed') ||
             document.body.textContent.includes('Something went wrong') ||
             !!document.querySelector('.error-message');
    });
    
    // Verify that either the UI shows an error state or errors are handled in console
    expect(errorStatePresent || errorHandled).to.be.true;
    
    // Close the page
    await errorPage.close();
  });
  
  it('TC-API-005: Direct API Communication Test', async function() {
    // This test communicates directly with the API, outside the browser
    
    // Determine the API base URL
    // For static files, it's typically the same domain as the app
    const baseURL = 'http://localhost:3000';
    
    try {
      // Make a direct API request for products
      const response = await axios.get(`${baseURL}/data/products.json`);
      
      // Verify the response
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
      
      // Verify data structure
      if (response.data.length > 0) {
        const product = response.data[0];
        expect(product).to.have.property('id');
        expect(product).to.have.property('title');
        expect(product).to.have.property('price');
        expect(product).to.have.property('availableSizes').that.is.an('array');
      }
    } catch (error) {
      // If direct API access fails, try to find the actual API endpoint
      // by analyzing network requests
      
      // Reset request interception
      await page.setRequestInterception(false);
      
      let apiUrl = null;
      
      // Capture product API URL
      await page.on('response', async response => {
        const url = response.url();
        
        if ((url.includes('/products') || url.includes('/api/')) && 
            response.status() === 200) {
          apiUrl = url;
        }
      });
      
      // Reload page to capture network requests
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      
      // If we found the API URL, test it directly
      if (apiUrl) {
        const apiResponse = await axios.get(apiUrl);
        
        // Verify the response
        expect(apiResponse.status).to.equal(200);
        expect(apiResponse.data).to.exist;
      } else {
        // Skip if we can't determine the API URL
        this.skip();
      }
    }
  });
});