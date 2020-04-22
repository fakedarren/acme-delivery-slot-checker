const puppeteer = require('puppeteer');

const loginUrl = 'https://secure.tesco.com/account/en-GB/login';
const slotsUrl = 'https://www.tesco.com/groceries/en-GB/slots/delivery';

const { DEBUG, TESCO_PASSWORD, TESCO_USER } = process.env;

module.exports = async () => {
  console.log('Tesco started...');

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
  await page.type('#username', TESCO_USER);
  await page.type('#password', TESCO_PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click('#sign-in-form > button'),
  ]);

  //
  // Check slots
  await Promise.all([page.waitForNavigation(), await page.goto(slotsUrl)]);
  await page.waitForSelector('.slot-grid--item, .book-a-slot--info-message');
  await page.evaluate(async () => {
    window.scrollBy(0, 1000);
  });

  const available = await page.evaluate(
    () =>
      Array.prototype.filter.call(
        document.querySelectorAll('.slot-grid--item'),
        (slot) => !slot.innerText.includes('Unavailable')
      ).length
  );

  //
  // Done. Close.
  await page.waitFor(4000);
  await browser.close();
  console.log(`Tesco run... (found ${available})`);
  console.log();

  return available;
};
