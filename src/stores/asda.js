const puppeteer = require('puppeteer');

const loginUrl = 'https://www.asda.com/login';
const slotsUrl =
  'https://groceries.asda.com/checkout/book-slot?tab=deliver&origin=/';

const { ASDA_PASSWORD, ASDA_USER, DEBUG } = process.env;

module.exports = async () => {
  console.log('Asda started...');

  //
  // Create browser
  const browser = await puppeteer.launch(
    Boolean(DEBUG)
      ? {
          args: ['--no-sandbox'],
          headless: false,
          slowMo: 25,
        }
      : {
          args: ['--no-sandbox'],
          slowMo: 25,
        }
  );

  const page = await browser.newPage();
  const userAgent = await page.evaluate(() => navigator.userAgent);

  await page.setUserAgent(userAgent.replace(/headless/gi, ''));
  await page.setViewport({ width: 1280, height: 768 });

  //
  // Go to log in page
  await Promise.all([page.waitForNavigation(), page.goto(loginUrl)]);

  //
  // Fill in details and submit
  await page.type('.username-box input[type="text"]', ASDA_USER);
  await page.type('#password', ASDA_PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click('form button[type="submit"]'),
  ]);

  //
  // Check slots
  await Promise.all([page.waitForNavigation(), await page.goto(slotsUrl)]);
  await page.waitForSelector('.co-slots__book-button');
  await page.evaluate(async () => {
    window.scrollBy(0, 1000);
  });

  const available = await page.evaluate(
    () =>
      Array.prototype.filter.call(
        document.querySelectorAll('.co-slots__book-button'),
        (slot) => !slot.innerText.includes('Sold Out')
      ).length
  );

  //
  // Done. Close.
  await page.waitFor(4000);
  await browser.close();
  console.log(`Asda run... (found ${available})`);
  console.log();

  return available;
};
