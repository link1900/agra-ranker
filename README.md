## Agra Ranking Server

Web server used to rank greyhounds.

## Required
- node & npm
- mongo

## Usage

Clone this repository

    $ npm install
    $ npm start

## Heroku setup
set environment var NODE_ENV to production:
 
`$ heroku config:set NODE_ENV=production`
    
set environment var MONGO_URL to your mongo database url:

`$ heroku config:set MONGO_URL="mongodb://somedatabase"`
    
deploy by:

`$ git push heroku master`