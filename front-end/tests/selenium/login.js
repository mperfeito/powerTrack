const { Builder, By, until } = require('selenium-webdriver');

(async function runTest() {

  let driver = await new Builder().forBrowser('chrome').build();

  try {
    console.log('Opening website...');

    // Open the Website
    await driver.get('http://localhost:5173/');

    // Go to Login Page
    console.log('Clicking on the button "Login"...');
    await driver.wait(until.elementLocated(By.css("a.btn.btn-primary")), 5000);
    const loginBtn = await driver.findElement(By.css("a.btn.btn-primary"));
    await driver.sleep(3000);
    await loginBtn.click();

    // Get Logged In
    console.log('Filling in the login form...');
    // Email
    await driver.wait(until.elementLocated(By.id('email')), 5000);
    await driver.findElement(By.id('email')).sendKeys('ana.martins123@example.org');  // insert email 

    // Password
    await driver.wait(until.elementLocated(By.id('password')), 5000);
    await driver.findElement(By.id('password')).sendKeys('AnaMartins@2024');  // insert password

    // Submit
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();
    await driver.sleep(2000);

    // While in Dashboard, click on the "Houses" Tab
    console.log('Clicking on the tab "Houses"...');
    const housesTab = await driver.wait(
    until.elementLocated(By.xpath("//div[contains(@class, 'nav-item')][.//span[text()='Houses']]")),
    5000
    );
    await housesTab.click();

    await driver.sleep(2000);

    console.log('Test completed successfully!');


  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await driver.quit();
  }
})();
