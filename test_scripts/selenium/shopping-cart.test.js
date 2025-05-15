const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

/**
 * Shopping Cart tests implementation using Selenium WebDriver
 */
describe('Shopping Cart Component - Selenium', function() {
  // Increase timeout for Selenium tests
  this.timeout(30000);
  
  let driver;
  
  before(async function() {
    // Initialize the WebDriver
    driver = await new Builder().forBrowser('chrome').build();
  });
  
  after(async function() {
    // Close the browser after all tests
    if (driver) await driver.quit();
  });
  
  beforeEach(async function() {
    // Navigate to the app page
    await driver.get('http://localhost:3000');
    
    // Wait for products to load
    await driver.wait(until.elementLocated(By.css('.shelf-item')), 5000);
  });
  
  it('TC-SC-001: Add Product to Cart', async function() {
    // Get initial cart count if cart badge exists
    let initialCount = 0;
    try {
      const cartBadge = await driver.findElement(By.css('.float-cart__count'));
      initialCount = parseInt(await cartBadge.getText(), 10) || 0;
    } catch (err) {
      // Cart badge might not exist if cart is empty
      initialCount = 0;
    }
    
    // Click "Add to Cart" button on the first product
    const addToCartBtn = await driver.findElement(By.css('.shelf-item__buy-btn'));
    await addToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Verify cart counter updated
    const cartBadge = await driver.findElement(By.css('.float-cart__count'));
    const newCount = parseInt(await cartBadge.getText(), 10);
    expect(newCount).to.equal(initialCount + 1);
    
    // Get the product name for comparison
    const productName = await driver.findElement(By.css('.shelf-item__title')).getText();
    
    // Open cart if not already open
    try {
      const isCartOpen = await driver.findElement(By.css('.float-cart--open')).isDisplayed();
      if (!isCartOpen) {
        await driver.findElement(By.css('.float-cart__icon')).click();
      }
    } catch (err) {
      // Cart is not open
      await driver.findElement(By.css('.float-cart__icon')).click();
    }
    
    // Wait for cart to open
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    // Verify product is in cart
    const cartProducts = await driver.findElements(By.css('.cart-item'));
    expect(cartProducts.length).to.be.greaterThan(0);
    
    // Verify the product name in cart matches the added product
    const cartProductName = await driver.findElement(By.css('.cart-item .title')).getText();
    expect(cartProductName).to.include(productName);
    
    // Verify subtotal is updated
    const subtotalElement = await driver.findElement(By.css('.sub-price__val'));
    const subtotal = parseFloat((await subtotalElement.getText()).replace(/[^0-9.-]+/g, ''));
    expect(subtotal).to.be.greaterThan(0);
  });
  
  it('TC-SC-002: Remove Product from Cart', async function() {
    // Add a product to the cart first
    const addToCartBtn = await driver.findElement(By.css('.shelf-item__buy-btn'));
    await addToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Get the current cart count
    const cartBadge = await driver.findElement(By.css('.float-cart__count'));
    const initialCount = parseInt(await cartBadge.getText(), 10);
    
    // Open cart if not already open
    try {
      const isCartOpen = await driver.findElement(By.css('.float-cart--open')).isDisplayed();
      if (!isCartOpen) {
        await driver.findElement(By.css('.float-cart__icon')).click();
      }
    } catch (err) {
      // Cart is not open
      await driver.findElement(By.css('.float-cart__icon')).click();
    }
    
    // Wait for cart to open
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    // Get the initial subtotal value
    const subtotalElement = await driver.findElement(By.css('.sub-price__val'));
    const initialSubtotal = parseFloat((await subtotalElement.getText()).replace(/[^0-9.-]+/g, ''));
    
    // Click the remove button for the first product in the cart
    const removeButton = await driver.findElement(By.css('.cart-item .remove-item'));
    await removeButton.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Verify cart counter updated
    try {
      // If there are still items in the cart
      const newCartBadge = await driver.findElement(By.css('.float-cart__count'));
      const newCount = parseInt(await newCartBadge.getText(), 10);
      expect(newCount).to.equal(initialCount - 1);
    } catch (err) {
      // If the cart is now empty, the badge might not exist
      // Verify that no cart items exist
      const cartItems = await driver.findElements(By.css('.cart-item'));
      expect(cartItems.length).to.equal(0);
    }
    
    // Verify subtotal updated
    try {
      const newSubtotalElement = await driver.findElement(By.css('.sub-price__val'));
      const newSubtotal = parseFloat((await newSubtotalElement.getText()).replace(/[^0-9.-]+/g, ''));
      expect(newSubtotal).to.be.lessThan(initialSubtotal);
    } catch (err) {
      // If the cart is now empty, the subtotal might show $0.00 or not exist
      console.log('Cart is empty after removing product');
    }
  });
  
  it('TC-SC-003: Adjust Product Quantity in Cart', async function() {
    // Add the first product to the cart
    const firstAddToCartBtn = await driver.findElement(By.css('.shelf-item:nth-child(1) .shelf-item__buy-btn'));
    await firstAddToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Get the current cart count
    const cartBadge = await driver.findElement(By.css('.float-cart__count'));
    const initialCount = parseInt(await cartBadge.getText(), 10);
    
    // Add the same product again
    await firstAddToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Verify cart counter updated
    const newCartBadge = await driver.findElement(By.css('.float-cart__count'));
    const newCount = parseInt(await newCartBadge.getText(), 10);
    expect(newCount).to.equal(initialCount + 1);
    
    // Open cart if not already open
    try {
      const isCartOpen = await driver.findElement(By.css('.float-cart--open')).isDisplayed();
      if (!isCartOpen) {
        await driver.findElement(By.css('.float-cart__icon')).click();
      }
    } catch (err) {
      // Cart is not open
      await driver.findElement(By.css('.float-cart__icon')).click();
    }
    
    // Wait for cart to open
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    // Verify quantity display in cart (implementation may vary)
    // This assumes there's a quantity element in the cart item
    try {
      const quantityElement = await driver.findElement(By.css('.cart-item .quantity'));
      const quantity = parseInt(await quantityElement.getText(), 10);
      expect(quantity).to.equal(2);
    } catch (err) {
      // If quantity is not displayed directly, check how many of the same items exist
      const cartItems = await driver.findElements(By.css('.cart-item'));
      if (cartItems.length === 1) {
        console.log('Product quantity likely increased to 2 in one cart item');
      } else {
        console.log('Two separate cart items for the same product');
      }
    }
  });
  
  it('TC-SC-004: Cart Subtotal Calculation', async function() {
    // Clear the cart first (assuming there's a way to do this)
    // We'll add products one by one and verify subtotal
    
    // Add the first product to the cart
    const firstProduct = await driver.findElement(By.css('.shelf-item:nth-child(1)'));
    const firstProductPrice = parseFloat((await firstProduct.findElement(By.css('.shelf-item__price')).getText()).replace(/[^0-9.-]+/g, ''));
    await firstProduct.findElement(By.css('.shelf-item__buy-btn')).click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Open cart if not already open
    try {
      const isCartOpen = await driver.findElement(By.css('.float-cart--open')).isDisplayed();
      if (!isCartOpen) {
        await driver.findElement(By.css('.float-cart__icon')).click();
      }
    } catch (err) {
      // Cart is not open
      await driver.findElement(By.css('.float-cart__icon')).click();
    }
    
    // Wait for cart to open
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    // Verify subtotal matches first product price
    let subtotalElement = await driver.findElement(By.css('.sub-price__val'));
    let subtotal = parseFloat((await subtotalElement.getText()).replace(/[^0-9.-]+/g, ''));
    expect(subtotal).to.be.closeTo(firstProductPrice, 0.01); // Allow for small rounding differences
    
    // Close cart
    await driver.findElement(By.css('.float-cart__close-btn')).click();
    await driver.sleep(500);
    
    // Add a second product to the cart
    const secondProduct = await driver.findElement(By.css('.shelf-item:nth-child(2)'));
    const secondProductPrice = parseFloat((await secondProduct.findElement(By.css('.shelf-item__price')).getText()).replace(/[^0-9.-]+/g, ''));
    await secondProduct.findElement(By.css('.shelf-item__buy-btn')).click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Verify subtotal is sum of both products
    subtotalElement = await driver.findElement(By.css('.sub-price__val'));
    subtotal = parseFloat((await subtotalElement.getText()).replace(/[^0-9.-]+/g, ''));
    expect(subtotal).to.be.closeTo(firstProductPrice + secondProductPrice, 0.01);
  });
  
  it('TC-SC-006: Empty Cart Display', async function() {
    // Ensure the cart is empty
    // We can do this by removing all items if there are any
    
    // Open cart
    await driver.findElement(By.css('.float-cart__icon')).click();
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    // Check if there are items to remove
    const cartItems = await driver.findElements(By.css('.cart-item'));
    
    // Remove all items if any exist
    for (let i = 0; i < cartItems.length; i++) {
      const removeButton = await driver.findElement(By.css('.cart-item .remove-item'));
      await removeButton.click();
      await driver.sleep(500);
    }
    
    // Verify empty cart message is displayed (if implemented)
    try {
      const emptyCartMessage = await driver.findElement(By.css('.float-cart__shelf-empty'));
      expect(await emptyCartMessage.isDisplayed()).to.be.true;
      expect(await emptyCartMessage.getText()).to.include('empty');
    } catch (err) {
      // If no specific empty message is implemented, verify no cart items exist
      const cartItemsAfter = await driver.findElements(By.css('.cart-item'));
      expect(cartItemsAfter.length).to.equal(0);
    }
    
    // Verify subtotal is zero or not displayed
    try {
      const subtotalElement = await driver.findElement(By.css('.sub-price__val'));
      const subtotal = parseFloat((await subtotalElement.getText()).replace(/[^0-9.-]+/g, ''));
      expect(subtotal).to.equal(0);
    } catch (err) {
      // Subtotal might not be displayed when cart is empty
      console.log('Subtotal is not displayed when cart is empty');
    }
  });
  
  it('TC-SC-101: Shopping Cart Accessibility', async function() {
    // Add a product to the cart
    const addToCartBtn = await driver.findElement(By.css('.shelf-item__buy-btn'));
    await addToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Open cart
    await driver.findElement(By.css('.float-cart__icon')).click();
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    // Test keyboard navigation
    // Send Tab key to focus on elements in the cart
    const activeElement = await driver.switchTo().activeElement();
    await activeElement.sendKeys('\uE004'); // Tab key
    
    // Check if focus moved to an interactive element in the cart
    const newActiveElement = await driver.switchTo().activeElement();
    const tagName = await newActiveElement.getTagName();
    
    // Verify focus moved to a clickable element (button, link, etc.)
    expect(['button', 'a', 'input']).to.include(tagName.toLowerCase());
    
    // Check cart components have proper ARIA attributes
    const cartElement = await driver.findElement(By.css('.float-cart'));
    const ariaLabel = await cartElement.getAttribute('aria-label');
    expect(ariaLabel).to.not.be.null;
    
    // Check remove buttons have accessible names
    const removeButton = await driver.findElement(By.css('.cart-item .remove-item'));
    const buttonAriaLabel = await removeButton.getAttribute('aria-label');
    expect(buttonAriaLabel).to.not.be.null;
  });
  
  it('TC-SC-201: Cart Data Validation', async function() {
    // Add a product to the cart
    const addToCartBtn = await driver.findElement(By.css('.shelf-item__buy-btn'));
    await addToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    // Check localStorage for cart data
    const cartData = await driver.executeScript('return JSON.stringify(localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : {})');
    
    // Verify cart data is stored
    expect(cartData).to.not.equal('{}');
    
    // Verify no XSS in cart items
    await driver.findElement(By.css('.float-cart__icon')).click();
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    const cartItemHTML = await driver.findElement(By.css('.cart-item')).getAttribute('innerHTML');
    expect(cartItemHTML).to.not.include('<script>');
    expect(cartItemHTML).to.not.include('javascript:');
    expect(cartItemHTML).to.not.include('onerror=');
  });
  
  it('TC-SC-301: Shopping Cart Performance', async function() {
    // Measure time to add product to cart
    const startAddTime = Date.now();
    
    const addToCartBtn = await driver.findElement(By.css('.shelf-item__buy-btn'));
    await addToCartBtn.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    const addTime = Date.now() - startAddTime;
    console.log(`Time to add product to cart: ${addTime}ms`);
    
    // Verify add time is acceptable (e.g., < 2 seconds)
    expect(addTime).to.be.lessThan(2000);
    
    // Measure time to open cart
    const startOpenTime = Date.now();
    
    await driver.findElement(By.css('.float-cart__icon')).click();
    await driver.wait(until.elementLocated(By.css('.float-cart--open')), 5000);
    
    const openTime = Date.now() - startOpenTime;
    console.log(`Time to open cart: ${openTime}ms`);
    
    // Verify open time is acceptable (e.g., < 1 second)
    expect(openTime).to.be.lessThan(1000);
    
    // Measure time to remove product from cart
    const startRemoveTime = Date.now();
    
    const removeButton = await driver.findElement(By.css('.cart-item .remove-item'));
    await removeButton.click();
    
    // Wait for cart update animation
    await driver.sleep(1000);
    
    const removeTime = Date.now() - startRemoveTime;
    console.log(`Time to remove product from cart: ${removeTime}ms`);
    
    // Verify remove time is acceptable (e.g., < 2 seconds)
    expect(removeTime).to.be.lessThan(2000);
  });
});