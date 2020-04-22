const puppeteer = require('puppeteer');

const loginUrl = 'https://www.waitrose.com/ecom/login';
const slotsUrl = 'https://www.waitrose.com/ecom/bookslot/delivery';

const { DEBUG, WAITROSE_PASSWORD, WAITROSE_USER } = process.env;

module.exports = async () => {
  console.log('Waitrose started...');

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
  // "Accept all cookies" modal
  page.click('[data-test="accept-all"]');
  await page.waitFor(1000);

  //
  // Fill in details and submit
  await page.type('[name="email"]', WAITROSE_USER);
  await page.type('#password', WAITROSE_PASSWORD);

  await Promise.all([page.waitForNavigation(), page.click('#loginSubmit')]);

  //
  // Check slots
  await Promise.all([page.waitForNavigation(), await page.goto(slotsUrl)]);
  await page.waitForSelector('[role="grid"] button');
  await page.evaluate(async () => {
    window.scrollBy(0, 1000);
  });

  const available = await page.evaluate(
    () =>
      Array.prototype.filter.call(
        document.querySelectorAll('.co-slots__book-button'),
        (slot) =>
          !slot.innerText.includes('Fully booked') &&
          !slot.innerText.includes('Unavailable')
      ).length
  );

  //
  // Done. Close.
  await page.waitFor(4000);
  await browser.close();
  console.log(`Waitrose run... (found ${available})`);
  console.log();

  return available;
};
