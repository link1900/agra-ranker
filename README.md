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
    - set environment var SESSION_SECRET to some secret string (heroku config:set SESSION_SECRET=whatever)
    - set environment var NODE_ENV to production (heroku config:set NODE_ENV=production)
    - deploy by git push heroku master