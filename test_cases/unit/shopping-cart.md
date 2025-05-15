# Shopping Cart Unit Tests

This document contains test cases for the Shopping Cart component of the React Shopping Cart application.

## Test Case Categories

The Shopping Cart component allows users to add, remove, and manage products in their cart.

## Test Cases

### TC-SC-001: Add Product to Cart

**Description:** Verify that products can be added to the shopping cart.

**Test Type:** Unit, Integration

**Priority:** High

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Click the "Add to Cart" button on a product
3. Verify the product is added to the cart
4. Verify the cart counter is updated
5. Verify the cart subtotal is updated correctly

**Expected Results:**
- Product is added to the cart with quantity 1
- Cart counter increases by 1
- Cart subtotal increases by the product price
- Cart UI is updated to show the added product

### TC-SC-002: Remove Product from Cart

**Description:** Verify that products can be removed from the shopping cart.

**Test Type:** Unit, Integration

**Priority:** High

**Preconditions:**
- App is running at http://localhost:3000
- At least one product is in the cart

**Test Steps:**
1. Visit the home page
2. Add a product to the cart if not already there
3. Open the floating cart
4. Click the remove button on a product
5. Verify the product is removed from the cart
6. Verify the cart counter is updated
7. Verify the cart subtotal is updated correctly

**Expected Results:**
- Product is removed from the cart
- Cart counter decreases by the product's quantity
- Cart subtotal decreases by the product's total price
- Cart UI is updated to reflect the removal

### TC-SC-003: Adjust Product Quantity in Cart

**Description:** Verify that product quantities can be adjusted in the cart.

**Test Type:** Unit, Integration

**Priority:** High

**Preconditions:**
- App is running at http://localhost:3000
- At least one product is in the cart

**Test Steps:**
1. Visit the home page
2. Add a product to the cart if not already there
3. Open the floating cart
4. Add the same product to the cart again
5. Verify the product quantity increases by 1
6. Verify the cart subtotal is updated correctly

**Expected Results:**
- Product quantity increases by 1 when the same product is added again
- Cart subtotal reflects the updated quantity
- UI shows the updated quantity

### TC-SC-004: Cart Subtotal Calculation

**Description:** Verify that the cart subtotal is calculated correctly.

**Test Type:** Unit, Data Integrity

**Priority:** High

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Add multiple products to the cart with different prices
3. Verify the cart subtotal equals the sum of all product prices in the cart

**Expected Results:**
- Cart subtotal should correctly reflect the sum of all product prices
- Calculation should account for product quantities

### TC-SC-005: Cart Persistence

**Description:** Verify that the cart state persists across page refreshes.

**Test Type:** Unit, Integration

**Priority:** Medium

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Add several products to the cart
3. Refresh the page
4. Verify the cart contents remain the same after refresh

**Expected Results:**
- Cart contents should persist after page refresh
- Cart counter, product quantities, and subtotal should remain accurate

### TC-SC-006: Empty Cart Display

**Description:** Verify that the cart displays correctly when empty.

**Test Type:** Unit, UI/UX

**Priority:** Medium

**Preconditions:**
- App is running at http://localhost:3000
- No products in the cart

**Test Steps:**
1. Visit the home page
2. Open the floating cart
3. Verify a "Your cart is empty" message is displayed
4. Verify the cart subtotal is 0

**Expected Results:**
- An appropriate message should be displayed when the cart is empty
- Cart counter should not be visible or should show 0
- Subtotal should be $0.00

### TC-SC-007: Cart Icon Badge

**Description:** Verify that the cart icon badge correctly displays the number of items in the cart.

**Test Type:** Unit, UI/UX

**Priority:** Medium

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Add multiple products to the cart
3. Verify the cart icon badge shows the correct total number of items

**Expected Results:**
- Cart icon badge should display the total number of items in the cart
- Badge should update immediately when products are added or removed

### TC-SC-008: Cart Animation

**Description:** Verify that cart animations work correctly when adding/removing products.

**Test Type:** Unit, UI/UX

**Priority:** Low

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Add a product to the cart
3. Verify the cart animation plays correctly
4. Remove a product from the cart
5. Verify the cart animation plays correctly

**Expected Results:**
- Animation should play when product is added to cart
- Animation should play when product is removed from cart
- Animations should be smooth and enhance the user experience

## Accessibility Testing

### TC-SC-101: Shopping Cart Accessibility

**Description:** Verify that the Shopping Cart component meets accessibility standards.

**Test Type:** Accessibility

**Priority:** High

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Open the cart
3. Run automated accessibility testing tool (axe-core)
4. Check for WCAG 2.1 AA compliance issues
5. Verify keyboard navigation through cart items

**Expected Results:**
- No critical accessibility issues found
- All interactive elements are keyboard accessible
- Proper focus management is implemented
- Color contrast meets requirements
- Quantity indicators are accessible to screen readers

## Security Testing

### TC-SC-201: Cart Data Validation

**Description:** Verify input validation and security for cart data.

**Test Type:** Security

**Priority:** High

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Inspect localStorage or sessionStorage for cart data
2. Check for proper data sanitization
3. Attempt to inject malicious content via browser storage

**Expected Results:**
- Cart data is stored securely
- Data is properly sanitized before rendering
- No XSS vulnerabilities exist
- Malicious data is handled safely

## Performance Testing

### TC-SC-301: Shopping Cart Performance

**Description:** Verify performance of the cart operations.

**Test Type:** Performance

**Priority:** Medium

**Preconditions:**
- App is running at http://localhost:3000

**Test Steps:**
1. Visit the home page
2. Measure time to add product to cart
3. Measure time to remove product from cart
4. Measure response time for opening/closing cart with many items
5. Add a large number of products to the cart (stress test)

**Expected Results:**
- Cart operations complete within acceptable time limits
- UI remains responsive with a large number of cart items
- Animations remain smooth and don't degrade performance