### Welcome

You have to set environment variables such as PORT, DATABASE, JWT_SECRET, JWT_EXPIRES_IN, JWT_COOKIE_EXPIRES_IN, EMAIL_FROM, SENDGRID_USERNAME, SENDGRID_PASSWORD, STRIPE_SECRET_KEY, STRIPE_PRODUCT, CLIENT_URL.

PORT - set PORT for APP to use. Default is 3000.

DATABASE - mongoose connection string

JWT Credentials :
JWT_SECRET - JWT secret key
JWT_EXPIRES_IN - Number of days to expire(example 90d)
JWT_COOKIE_EXPIRES_IN= Number of days to expire(example 90)

Sendgrid Email Credentials :  EMAIL_FROM, SENDGRID_USERNAME, SENDGRID_PASSWORD

Stripe Credentials : STRIPE_SECRET_KEY, STRIPE_PRODUCT

In the project directory, you can run:

### `npm run start`

to start the SERVER.




