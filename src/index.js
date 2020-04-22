require('dotenv').config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  TWILIO_TO_NUMBER,
} = process.env;

const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const asda = require('./stores/asda');
const tesco = require('./stores/tesco');
const waitrose = require('./stores/waitrose');

(async () => {
  console.log('Loading...');
  console.log();

  const asdaSlots = await asda();
  const tescoSlots = await tesco();
  const waitroseSlots = await waitrose();

  const found = asdaSlots || tescoSlots || waitroseSlots;

  console.log(`Result: ${found}`);

  if (found) {
    console.log('Sending text...');

    let message = 'Found!';

    if (asdaSlots) message += ' Asda!';
    if (tescoSlots) message += ' Tesco!';
    if (waitroseSlots) message += ' Waitrose!';

    try {
      await twilio.messages.create({
        body: message,
        from: TWILIO_FROM_NUMBER,
        to: TWILIO_TO_NUMBER,
      });
      console.log('Sent text.');
    } catch (err) {
      console.log(`Error sending text (${err.message})`);
    }
  }

  console.log('Done.');
})();
