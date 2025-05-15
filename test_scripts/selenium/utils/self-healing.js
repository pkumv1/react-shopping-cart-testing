/**
 * Self-healing test utilities for handling dynamic UI elements
 * This module provides mechanisms to make tests more resilient to UI changes
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// Storage for element locators
const LOCATORS_FILE = path.join(__dirname, '../..', 'config', 'element-locators.json');

class SelfHealingDriver {
  constructor(driver) {
    this.driver = driver;
    this.locatorStrategies = ['css', 'xpath', 'id', 'name', 'class', 'tag'];
    this.loadLocators();
  }

  /**
   * Load saved locators from file
   */
  loadLocators() {
    try {
      if (fs.existsSync(LOCATORS_FILE)) {
        this.locators = JSON.parse(fs.readFileSync(LOCATORS_FILE, 'utf8'));
      } else {
        this.locators = {};
        // Ensure directory exists
        fs.mkdirSync(path.dirname(LOCATORS_FILE), { recursive: true });
        fs.writeFileSync(LOCATORS_FILE, JSON.stringify(this.locators, null, 2));
      }
    } catch (error) {
      console.error('Error loading locators:', error);
      this.locators = {};
    }
  }

  /**
   * Save locators to file
   */
  saveLocators() {
    try {
      fs.writeFileSync(LOCATORS_FILE, JSON.stringify(this.locators, null, 2));
    } catch (error) {
      console.error('Error saving locators:', error);
    }
  }

  /**
   * Find an element with self-healing capability
   * @param {string} elementName - Logical name for the element
   * @param {Array} strategies - Array of locator strategies to try
   * @returns {Promise<WebElement>}
   */
  async findElement(elementName, strategies) {
    // Check if we have a saved strategy that worked previously
    if (this.locators[elementName] && this.locators[elementName].value) {
      try {
        const element = await this.driver.findElement({
          [this.locators[elementName].by]: this.locators[elementName].value
        });
        return element;
      } catch (error) {
        console.log(`Saved locator for ${elementName} failed, trying alternatives...`);
      }
    }

    // Try each strategy until one works
    let lastError = null;
    for (const strategy of strategies) {
      try {
        const element = await this.driver.findElement({
          [strategy.by]: strategy.value
        });
        
        // Save the successful strategy
        this.locators[elementName] = {
          by: strategy.by,
          value: strategy.value
        };
        this.saveLocators();
        
        return element;
      } catch (error) {
        lastError = error;
      }
    }

    // If no strategy worked, throw the last error
    throw lastError || new Error(`Could not find element: ${elementName}`);
  }

  /**
   * Click an element with self-healing capability
   * @param {string} elementName - Logical name for the element
   * @param {Array} strategies - Array of locator strategies to try
   * @returns {Promise<void>}
   */
  async click(elementName, strategies) {
    const element = await this.findElement(elementName, strategies);
    await element.click();
  }

  /**
   * Send keys to an element with self-healing capability
   * @param {string} elementName - Logical name for the element
   * @param {Array} strategies - Array of locator strategies to try
   * @param {string} text - Text to type
   * @returns {Promise<void>}
   */
  async sendKeys(elementName, strategies, text) {
    const element = await this.findElement(elementName, strategies);
    await element.sendKeys(text);
  }

  /**
   * Get text from an element with self-healing capability
   * @param {string} elementName - Logical name for the element
   * @param {Array} strategies - Array of locator strategies to try
   * @returns {Promise<string>}
   */
  async getText(elementName, strategies) {
    const element = await this.findElement(elementName, strategies);
    return await element.getText();
  }

  /**
   * Check if an element exists with self-healing capability
   * @param {string} elementName - Logical name for the element
   * @param {Array} strategies - Array of locator strategies to try
   * @returns {Promise<boolean>}
   */
  async elementExists(elementName, strategies) {
    try {
      await this.findElement(elementName, strategies);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate alternative locator strategies for an element
   * @param {string} primaryLocator - Primary locator value
   * @param {string} locatorType - Type of locator (css, xpath, etc.)
   * @returns {Array} Array of alternative strategies
   */
  generateAlternativeLocators(primaryLocator, locatorType) {
    const alternatives = [];
    
    // Add the primary locator first
    alternatives.push({
      by: locatorType,
      value: primaryLocator
    });
    
    // Generate alternatives based on the type
    if (locatorType === 'css') {
      // For CSS selectors, we can try different attribute-based selectors
      if (primaryLocator.includes('.')) {
        // Try with class name
        const className = primaryLocator.split('.')[1].split(' ')[0];
        alternatives.push({
          by: 'css',
          value: `[class*="${className}"]`
        });
      }
      
      if (primaryLocator.includes('#')) {
        // Try with ID
        const id = primaryLocator.split('#')[1].split(' ')[0];
        alternatives.push({
          by: 'id',
          value: id
        });
      }
      
      // Try XPath equivalent
      let xpathEquivalent = primaryLocator
        .replace('.', '')
        .replace('#', '@id="')
        .replace(/ /g, '');
        
      if (xpathEquivalent.includes('@id="')) {
        xpathEquivalent += '"';
      }
      
      alternatives.push({
        by: 'xpath',
        value: `//*[${xpathEquivalent}]`
      });
    } else if (locatorType === 'xpath') {
      // For XPath, we can try making it more flexible
      if (primaryLocator.includes('@id')) {
        // Extract ID and convert to CSS
        const idMatch = primaryLocator.match(/@id=['"]([^'"]+)['"]/);
        if (idMatch && idMatch[1]) {
          alternatives.push({
            by: 'css',
            value: `#${idMatch[1]}`
          });
          
          alternatives.push({
            by: 'id',
            value: idMatch[1]
          });
        }
      }
      
      if (primaryLocator.includes('@class')) {
        // Extract class and convert to CSS
        const classMatch = primaryLocator.match(/@class=['"]([^'"]+)['"]/);
        if (classMatch && classMatch[1]) {
          alternatives.push({
            by: 'css',
            value: `.${classMatch[1].replace(/ /g, '.')}`
          });
        }
      }
    }
    
    return alternatives;
  }
}

module.exports = SelfHealingDriver;