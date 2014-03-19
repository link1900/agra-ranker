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
    - run the initDataSetup.js on the mongo database
    - set environment var SESSION_SECRET to some secret string (heroku config:set SESSION_SECRET=whatever)
    - set environment var NODE_ENV to production (heroku config:set NODE_ENV=production)
    - deploy by git push heroku master

# Todo
## Round 1 - Basics

### Greyhound
- (DONE) interactive validation of name
- (DONE) have a view form for a greyhound
- (DONE) clicking table loads greyhound details into view form
- (DONE) have an edit mode
- (DONE) delete an existing greyhound
- (DONE) edit an existing greyhound
- (DONE) sire & dam fields (nav, edit, view)
- (DONE) limit all server queries to 100 records (try to make it for all mongo queries in mongoose)
- (DONE) backend pass through for limit and size
- (DONE) table pagination
- (DONE) search greyhound table
- (DONE) correctly display sire and dam on greyhound list
- (DONE) fix delete so that pointerless records are not left. (server side)
- (DONE) list offspring on view page
- (DONE) Batch System for delayed processing
- (DONE) greyhound data auto importer (streaming backend) http://ngmodules.org/modules/angular-file-upload
- (DONE) setup login
- (DONE) setup action security around editing greyhounds and creating greyhounds

### Deployment
- (DONE) setup heroku app
- (DONE) setup prod key
- (DONE) deploy to heroku
- (DONE) test that it works online

### Refactor Cleanups
- (DONE) fix the top menu so that it looks nice in firefox and has highlighting
- (DONE) force https and piggy back on heroku certs
- (DONE) make the login screen work with lastpass and normal auto complete
- (DONE) Move table to a directive
- fix sire selector to always get all results or do inactive paging
- (DONE) fix offspring table to be actual table
- Clean up the server loader. Remove all front end templating.

### Races
- list races
- create race (no placings)
- view race
- edit race
- race csv import (simple)

### Placings
- interactive drag and drop of text fields for placing creation on race screen (with rug pictures)
- races / placings listed on the greyhound view
- edit placing from greyhound view
- edit placing from race view
- delete placing when greyhound is deleted
- delete placing when race is deleted


### Refactor Cleanups 2
- Move upload to a directive

### Rules & Rankings
- design rules and ranking storage
- add the rules page (lists the ranking rules)
- list ranking
- update when greyhound is deleted
- update when race is deleted

## Round 2 - Getting to Ranker 6 Level
- table pick the page size
- table sort
- table export to csv
- rankings export to special csv
- Sire and racer edit should be a select2 / text input directive
- Add prompts for delete actions
- inline create form on greyhound
- inline edit form on greyhound
- search on keydown for tables search box

## Round 3 - Beyond the ranker 6
- global search (on a search page)
- Add a find parents button
- list a race calendar when creating a race and have auto fill
- on race list page list the calendar for the current month (one colour for entered, another for pending, another for guessed)
- warn for missing race at the end of the month
- have the ability to send notifications if races are missed
- graph of how a greyhound has preformed over the year
- graph to compare to greyhounds
