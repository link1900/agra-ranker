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
set environment var SESSION_SECRET to some secret string:

`$ heroku config:set SESSION_SECRET=whatever`
    
set environment var NODE_ENV to production:
 
`$ heroku config:set NODE_ENV=production`
    
set environment var MONGO_URL to your mongo database url:

`$ heroku config:set MONGO_URL="mongodb://somedatabase"`
   
set environment var FIRST_USER_PASSCODE to your a secret passcode that first admin can use to register:
   
`$ heroku config:set FIRST_USER_PASSCODE=supersecret`
    
deploy by:

`$ git push heroku master`