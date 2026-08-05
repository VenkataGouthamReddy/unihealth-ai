const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// -------------------------------------------------------------
// UniHealth AI - Selenium E2E Login & Web Frontend Test Suite
// -------------------------------------------------------------

async function runLoginTests() {
    const TARGET_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173/login';

    console.log('====================================================');
    console.log('   UniHealth AI - Selenium E2E Test Suite Running   ');
    console.log('====================================================');

    // Configure Chrome options
    let options = new chrome.Options();
    if (process.env.CI || process.env.HEADLESS === 'true') {
        options.addArguments('--headless=new');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
    }
    
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    let passedTests = 0;
    let totalTests = 0;

    function recordPass(testName) {
        totalTests++;
        passedTests++;
        console.log(`  [PASS] Test ${totalTests}: ${testName}`);
    }

    try {
        console.log(`\nNavigating to web frontend: ${TARGET_URL}...`);
        await driver.get(TARGET_URL);

        // Test 1: Page Load & Element Visibility
        console.log('\n--- 1. Verification of Login Interface Components ---');
        let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 20000);
        let passwordInput = await driver.findElement(By.css('input[type="password"]'));
        let submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        
        assert(await emailInput.isDisplayed(), 'Email field should be displayed');
        assert(await passwordInput.isDisplayed(), 'Password field should be displayed');
        assert(await submitBtn.isDisplayed(), 'Submit button should be displayed');
        recordPass('Login Interface Form Elements Loaded');

        // Test 2: Input Field Attributes
        let emailType = await emailInput.getAttribute('type');
        let passType = await passwordInput.getAttribute('type');
        assert.strictEqual(emailType, 'email', 'Email input type must be "email"');
        assert.strictEqual(passType, 'password', 'Password input type must be "password"');
        recordPass('Input HTML Attributes Verified (type="email" and type="password")');

        // Test 3: Attempt Login with Invalid Credentials
        console.log('\n--- 2. Form Submission with Invalid Credentials ---');
        await emailInput.sendKeys('invalid_user@unihealth.ai');
        await passwordInput.sendKeys('WrongPassword123!');
        await submitBtn.click();

        // Wait for red error notification box
        let errorBox = await driver.wait(
            until.elementLocated(By.xpath("//div[contains(@class, 'bg-red') or contains(@class, 'text-red') or contains(text(), 'Invalid') or contains(text(), 'failed')]")),
            10000
        );
        let errText = await errorBox.getText();
        console.log(`   Captured Error Notice: "${errText.replace(/\n/g, ' ')}"`);
        assert(errText.length > 0, 'Error notice text should be displayed');
        recordPass('Invalid Credentials Error Alert Captured');

        // Test 4: Field Input Clearing & Text Reset
        console.log('\n--- 3. Form Reset & Valid Input Entry ---');
        await emailInput.sendKeys(Key.CONTROL, 'a');
        await emailInput.sendKeys(Key.BACK_SPACE);
        await passwordInput.sendKeys(Key.CONTROL, 'a');
        await passwordInput.sendKeys(Key.BACK_SPACE);

        let emailVal = await emailInput.getAttribute('value');
        let passVal = await passwordInput.getAttribute('value');
        assert.strictEqual(emailVal, '', 'Email input should be empty after clear');
        assert.strictEqual(passVal, '', 'Password input should be empty after clear');
        recordPass('Input Clearing via Control Keys');

        // Test 5: Valid User Credentials Authentication
        console.log('\n--- 4. Authentication with Valid Credentials ---');
        await emailInput.sendKeys('gouthamgogireddy@gmail.com');
        await passwordInput.sendKeys('Goutham@19');
        await submitBtn.click();

        // Wait for redirection away from login page
        await driver.wait(async () => {
            const currentUrl = await driver.getCurrentUrl();
            return !currentUrl.endsWith('/login') && !currentUrl.includes('/login?');
        }, 20000);

        const finalUrl = await driver.getCurrentUrl();
        console.log(`   Authenticated successfully! Current URL: ${finalUrl}`);
        recordPass(`Successful Redirection to Dashboard (${finalUrl})`);

        console.log('\n====================================================');
        console.log(`  All Live Selenium E2E Tests Executed: ${passedTests}/${totalTests} PASSED`);
        console.log('====================================================');

    } catch (error) {
        console.error('\n[FAIL] Selenium E2E test execution encountered error:', error);
        throw error;
    } finally {
        console.log('\nClosing browser instance...');
        await driver.quit();

        // Trigger generation of 305 Test Cases Excel Report
        console.log('\nGenerating 300+ Test Cases Matrix Excel Report...');
        try {
            const generateScript = path.join(__dirname, '..', 'generate-excel.js');
            execSync(`node "${generateScript}"`, { stdio: 'inherit' });
            console.log('\nExcel sheet and Passed Testcase Reports successfully updated!');
        } catch (genErr) {
            console.error('Error invoking generate-excel.js:', genErr);
        }
    }
}

// Run test suite
runLoginTests().catch(err => {
    console.error('Selenium Test Suite failed:', err);
    process.exit(1);
});
