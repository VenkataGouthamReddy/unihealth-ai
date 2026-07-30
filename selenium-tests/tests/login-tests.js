const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// -------------------------------------------------------------
// UniHealth AI - Selenium E2E Login Tests
// -------------------------------------------------------------

async function runLoginTests() {
    // Replace with your local or production frontend URL
    const TARGET_URL = 'http://localhost:5173/login'; // Pointing specifically to the login route

    // Initialize Chrome Driver
    let options = new chrome.Options();
    if (process.env.CI) {
        options.addArguments('--headless=new');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
    }
    
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log(`Navigating to ${TARGET_URL}...`);
        await driver.get(TARGET_URL);

        // Wait for the login form to be visible
        await driver.wait(until.elementLocated(By.css('input[type="email"]')), 30000);

        console.log('Test 1: Invalid Credentials');
        await driver.findElement(By.css('input[type="email"]')).sendKeys('wrong_user@example.com');
        await driver.findElement(By.css('input[type="password"]')).sendKeys('wrong_password');
        await driver.findElement(By.css('button[type="submit"]')).click();

        let invalidMsg = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'bg-red-50')]")), 10000);
        let msgText = await invalidMsg.getText();
        assert.match(msgText.toLowerCase(), /invalid|server|connecting|incorrect/, 'Expected invalid credentials or server error');

        console.log('Test 2: Valid Credentials');
        let usernameField = await driver.findElement(By.css('input[type="email"]'));
        let passwordField = await driver.findElement(By.css('input[type="password"]'));
        
        // Clear previous input (using CTRL+A then BACKSPACE for React compatibility)
        const { Key } = require('selenium-webdriver');
        await usernameField.sendKeys(Key.CONTROL, 'a');
        await usernameField.sendKeys(Key.BACK_SPACE);
        await passwordField.sendKeys(Key.CONTROL, 'a');
        await passwordField.sendKeys(Key.BACK_SPACE);
        
        // Input valid credentials
        await usernameField.sendKeys('gouthamgogireddy@gmail.com');
        await passwordField.sendKeys('Goutham@19');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // Wait for navigation away from login (to student, doctor, or admin dashboard)
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return !url.includes('/login');
        }, 30000);
        console.log('Dashboard reached successfully!');

        // E2E Login complete
        console.log('All login E2E tests passed successfully!');

    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        console.log('Closing browser...');
        await driver.quit();
    }
}

// Execute the tests
runLoginTests();
