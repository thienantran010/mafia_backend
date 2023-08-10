How to set up:

1. Fork from this repo
2. Clone the fork into local machine
3. Create a file called .env in src folder
4. Fill out .env file with the following variables
    - PORT
    - MY_EMAIL
    - MY_PASSWORD 
    - SENDGRID_API_KEY
    - SENDGRID_ACCOUNT
    - SENDGRID_PW
    - ACCESS_TOKEN_KEY
    - REFRESH_TOKEN_KEY
    - FRONTEND_URL
    - MONGODB_USERNAME
    - MONGODB_PASSWORD
    - MONGODB_CONNECTION

PORT is the port where the server will run. Most likely it is 4000.
MY_EMAIL and MY_PASSWORD is the email and associated password used to send confirmation emails. I used a gmail account.
SENDGRID_API_KEY, SENDGRID_ACCOUNT, and SENDGRID_PW can all be obtained by signing up for a SENDGRID account
and using their API.
ACCESS_TOKEN_KEY and REFRESH_TOKEN_KEY can be generated at the command line/terminal. Type `node` to enter
node and then `crypto.randomBytes(64).toString("hex");` to generate a key. do this for the access and refresh key.
FRONTEND_URL is the url of your frontend. Most likely it is http://localhost:5173.
MONGODB_USERNAME, MONGODB_PASSWORD, and MONGODB_CONNECTION can be obtained by creating a mongodb atlas
database. MDN walks through the process of instantiating a database [here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose)

5. I used yarn, so install yarn if you don't have it yet. Then, run `yarn add` to install dependencies
6. run `yarn run serve` to start dev environment/server