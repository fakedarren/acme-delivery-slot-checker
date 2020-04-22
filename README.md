# Acme Delivery Slot Checker

My neighbour has not been able to find a slot for a home delivery here in Central London. It seems it's always sold out.

This uses puppeteer to open a browser, log you in, and check for slots. You can run it with something like `cron` and get it to check periodically.

If it finds one, it will text you.

This software does not (and cannot) solve the problem of these slots selling out before you can log in to book one....


## Installing

You need accounts for Asda, Tesco, Waitrose, with your address set.

If you want to get texts, you'll need a [Twilio](https://www.twilio.com/) account, which is not free (but very cheap). You will need an SMS-capable Twilio number.

- `cp .env.sample .env` to create `.env` for your personal details
- `npm install`
- `npm start`


## Running on Heroku

It's really easy to run it on Heroku. You can run it all on Hobby instances, which are basically free.

- Create an app in the 'Europe' region
- Add the following buildpacks:
  - `heroku/nodejs`
  - `https://github.com/jontewks/puppeteer-heroku-buildpack.git`
- Configure your environment variables, the list is in `.env.sample`
- Deploy the codebase to Heroku
- Add a 'Heroku Scheduler' resource
- Configure this to run `npm start` every 10 minutes

That's it! You will get a text if it sees slots. 
