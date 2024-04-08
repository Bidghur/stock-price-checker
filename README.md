# Stock Price Checker

## Description
This project built only for test porpuses.

## Installation

```bash
$ npm install
```
## Needed env variables

Create .env folder in the root folder and you need to define two variables there.
```bash
# for use finnhub third party API for stock prices, provide your token here to get access to their endpoints
$ FINNHUB_TOKEN=

# for test usage you can just use tha provided sqlite db
$ DATABASE_URL="file:../sqlite.db"
```

## Running the app

```bash
# development
$ npm run start / npm start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Use the app

After you ran the application with the previous step, now you can access it with different methods:
1. Using Postman with the included postman collection.
2. Using Swagger doc, just hit [http://localhost:3000/api](http://localhost:3000/api) URL.

## Test

```bash
# unit tests
$ npm run test
```
