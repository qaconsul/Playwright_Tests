import { test, expect } from '@playwright/test';
//import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { selectors } from './selectors';

// Test fixture for account creation and checkout
test.describe('Account Creation, Login and Checkout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://automationexercise.com');
  });

  // Helper function to send POST request
  async function createAccount(accountData) {
    try {
      const response = await fetch('http://automationexercise.com/api/createAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(accountData).toString(),
      });

      const result = await response.json();
      return {
        status: response.status,
        body: result,
      };
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  // Helper function to create and save credentials
  function saveCredentials(credentials) {
    try {
      const credentialsPath = path.join(process.cwd(), 'user_credentials.json');
      fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), 'utf-8');
      console.log(`Credentials saved to: ${credentialsPath}`);
    } catch (error) {
      console.error('Error saving credentials file:', error);
      throw error;
    }
  }

  // Helper function to retrieve credentials from JSON
  function loadCredentials() {
    try {
      const credentialsPath = path.join(process.cwd(), 'user_credentials.json');
      const credentialsData = fs.readFileSync(credentialsPath, 'utf-8');
      return JSON.parse(credentialsData);
    } catch (error) {
      console.error('Error reading credentials file:', error);
      throw error;
    }
  }

  // Test case for complete checkout flow
  test('Test: Create account, login, add products, checkout and verify invoice', async ({ page, context }) => {
    // Step 1: Send POST request to create account
    console.log('Step 1: Sending POST request to create account...');
    const accountData = {
      name: 'John Doe',
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPassword123',
      title: 'Mr',
      birth_date: '15',
      birth_month: '05',
      birth_year: '1990',
      firstname: 'John',
      lastname: 'Doe',
      company: 'Tech Company',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      country: 'United States',
      zipcode: '10001',
      state: 'NY',
      city: 'New York',
      mobile_number: '1234567890',
    };

    const response = await createAccount(accountData);

    // Step 2: Verify response status
    console.log('Step 2: Verifying response status...');
    expect(response.status).toBe(200);

    // Step 3: Verify response body
    console.log('Step 3: Verifying response body...');
    expect(response.body).toBeTruthy();
    expect(response.body.responseCode).toBe(201);

    // Step 4: Log success response
    console.log('Step 4: Account created successfully!');
    console.log('Response:', JSON.stringify(response.body, null, 2));

    // Step 5: Create user_credentials.json in local folder
    console.log('Step 5: Creating user_credentials.json in local folder...');

    // Step 6: Save user credentials to user_credentials.json file
    console.log('Step 6: Saving user credentials to user_credentials.json file...');
    const credentialsToSave = {
      name: accountData.name,
      email: accountData.email,
      password: accountData.password,
      title: accountData.title,
      birth_date: accountData.birth_date,
      birth_month: accountData.birth_month,
      birth_year: accountData.birth_year,
      firstname: accountData.firstname,
      lastname: accountData.lastname,
      company: accountData.company,
      address1: accountData.address1,
      address2: accountData.address2,
      country: accountData.country,
      zipcode: accountData.zipcode,
      state: accountData.state,
      city: accountData.city,
      mobile_number: accountData.mobile_number,
    };
    saveCredentials(credentialsToSave);
    console.log('Step 6: Credentials saved successfully');

    // Step 7: Navigate to http://automationexercise.com
    console.log('Step 7: Navigating to http://automationexercise.com...');
    await page.goto('http://automationexercise.com');
    console.log('Step 7: Navigation completed');

    // Step 8: Retrieve credentials from user_credentials.json
    console.log('Step 8: Retrieving credentials from user_credentials.json...');
    const retrievedCredentials = loadCredentials();
    console.log('Step 8: Credentials retrieved successfully');
    console.log('Retrieved Credentials:', JSON.stringify(retrievedCredentials, null, 2));

    // Step 9: Perform UI login with email and password from credentials
    console.log('Step 9: Performing UI login with retrieved credentials...');

    // Click on Login link
    await page.click('a:has-text("Login")');

    // Wait for login page and enter email
    await page.fill(selectors.loginEmail, retrievedCredentials.email);
    await page.fill(selectors.loginPassword, retrievedCredentials.password);
    await page.click(selectors.logButton);

    // Wait for login to complete
    await page.waitForTimeout(2000);
    console.log('Step 9: Login completed successfully');

    // Step 10: Add two products to the cart from different categories
    console.log('Step 10: Adding two products to the cart from different categories...');

    // Navigate to products
    console.log('Navigating to products page...');
    await page.click(selectors.productsLink);
    await page.waitForTimeout(2000);

    // Browse and add product to cart
    console.log('Adding product to cart...');
    const productWrappers = page.locator(selectors.productWrapper);
    const productCount = await productWrappers.count();
    expect(productCount).toBeGreaterThan(0);

    // Add first product to cart
    const firstProduct = productWrappers.first();
    const addToCartButton1 = firstProduct.locator(selectors.addToCartBtn).first();

    await firstProduct.hover();
    await page.waitForTimeout(500);
    await addToCartButton1.click();

    console.log('1st Product added to cart');
    await page.waitForTimeout(2000);

    // Continue shopping
    try {
      const continueBtn = page.locator(selectors.continueShop + ':has-text("Continue Shopping")').first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('No continue button found');
    }

    // Add second product (from different category)
    const secondProduct = productWrappers.nth(1);
    const addToCartButton2 = secondProduct.locator(selectors.addToCartBtn).first();

    await secondProduct.hover();
    await page.waitForTimeout(500);
    await addToCartButton2.click();

    console.log('2nd Product added to cart');
    await page.waitForTimeout(2000);

    // Continue shopping
    try {
      const continueBtn = page.locator(selectors.continueShop + ':has-text("Continue Shopping")').first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('No continue button found');
    }

    console.log('Step 10: Two products added to cart successfully');

    // Step 11: Proceed to checkout and complete the order
    console.log('Step 11: Proceeding to checkout...');
    // clicking View Cart button
    await page.click(selectors.viewCartLink);
    await page.waitForTimeout(1000);
    // clicking 'proceed to check out' button
    await page.click(selectors.checkoutLink);
    await page.waitForTimeout(2000);

    console.log('On checkout page');

    // Step 12: Verify order placement
    console.log('Step 12: Verifying order placement...');

    const placeOrderButton = page.locator(selectors.checkoutLink + ':has-text("Place Order")');
    await placeOrderButton.scrollIntoViewIfNeeded();
    await placeOrderButton.click();
    await page.waitForTimeout(5000);
    await page.click(selectors.payButton);
    await page.waitForTimeout(5000);

    await page.fill(selectors.nameOnCard, 'Test User');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');

    await page.fill(selectors.cardNumber, '4111111111111111');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');

    await page.fill(selectors.cvc, '123');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');

    await page.fill(selectors.expMonth, '12');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');

    await page.fill(selectors.expYear, '2045');

    // Place order
    console.log('Placing order...');
    await page.click(selectors.payButton);
    await page.waitForTimeout(3000);
    console.log('Order placement submitted');

    console.log('Order placed');

    // Step 13: Assert success confirmation message and validate checkout success URL
    console.log('Step 13: Asserting success confirmation message and validating URL...');
    await page.waitForTimeout(2000);

    const successMsg = page.locator(selectors.sucessMessage);
    await expect(successMsg).toContainText('Order Placed!');

    const currentUrl = page.url();
    expect(currentUrl).toContain('payment_done');

    console.log('Order success confirmed');

    // Step 14: Download the invoice
    console.log('Step 14: Downloading the invoice...');

    const downloadInvoiceButton = page.locator(selectors.checkoutLink + ':has-text("Download Invoice")');

    // Start listening for downloads before clicking
    
    await downloadInvoiceButton.click();

    await page.waitForTimeout(2000);

    console.log('Step 14: Invoice download initiated');

    // Step 15 & 16: Verify the invoice file
    console.log('Step 15: Verifying invoice file...');

    const downloadsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads');

    // Read all files from source (Downloads) directory
    const files = fs.readdirSync(downloadsPath);

    // Find PDF invoice file
    const invoiceFile = files.find(file => file.endsWith('.*') || file.includes('invoice'));
    console.log('Step 15: Invoice files found:', invoiceFile);

    // Step 16: Check if file exists in the local downloads directory
    console.log('Step 16: Checking if invoice file exists in downloads directory...');

    if (invoiceFile) {
      const invoicePath = path.join(downloadsPath, invoiceFile);
      expect(fs.existsSync(invoicePath)).toBeTruthy();
      console.log('Step 16: Invoice file exists at:', invoicePath);

      // Step 17: Assert file size > 0 (non-empty)
      console.log('Step 17: Asserting file size > 0 (non-empty)...');

      const stats = fs.statSync(invoicePath);
      const fileSize = stats.size;

      expect(fileSize).toBeGreaterThan(0);
      console.log('Step 17: Invoice file size verified:', fileSize, 'bytes');
    } else {
      console.warn('Step 16-17: No invoice file found in downloads directory');
    }

    console.log('All steps completed successfully!');
  });
});
