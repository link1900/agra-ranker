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
- (DONE) fix sire selector to always get all results or do inactive paging
- (DONE) fix offspring table to be actual table
- (DONE) Clean up the server loader. Remove all front end templating.

### Group Rank API
- (DONE) add group rank api
- (DONE) create group rank api
- (DONE) update group rank api
- (DONE) delete group rank api
- (DONE) delete cleaned up race references

### Races API
- (DONE) list races api
- (DONE) create race api (no placings)
- (DONE) view race api
- (DONE) edit race api

### Placings API
- (DONE) create a placing api
- (DONE) edit a placing api
- (DONE) list placing api (query for by race or greyhound)
- (DONE) delete a placing api
- (DONE) delete placing when greyhound is deleted
- (DONE) delete placing when race is deleted

### Group Rank UI
- (DONE) list group levels
- (DONE) group rank edit screen
- (DONE) group rank create screen
- (DONE) group rank delete button

### Race UI
- (DONE) List out all races on the race screen
- (DONE) race edit screen
- (DONE) race create screen
- (DONE) race delete button

### Placing UI
- change placing position as a string
- put in place did not finish and disqualification as valid strings
- validate the placing position as a certain types of string
- races / placings listed on the greyhound view
- interactive drag and drop of text fields for placing creation on race screen
- edit placing from greyhound view
- edit placing from race view

### Point Scale API
- (DONE) create point scale value api
- (DONE) update point scale value api
- (DONE) get point scale value api
- (DONE) delete point scale value api
- (DONE) create point scale api
- (DONE) update point scale api
- (DONE) get point scale api
- (DONE) delete point scale api
- (DONE) point scale api tests
- (DONE) clean up point scale value references when deleted

### Query Parameters API
- (DONE) create query parameter api
- (DONE) update query parameter api
- (DONE) delete query parameter api
- (DONE) get query parameters api
- (DONE) query parameter api tests

### Query API
- (DONE) create query api
- (DONE) update query api
- (DONE) delete query api
- (DONE) get query api
- (DONE) query api tests
- delete query parameters when this is deleted
- when point scales are deleted clean up ranking query references to that point scale

### Ranking System API
- (DONE) design rules standard rule parameters: time period, point tables, point decay
- (DONE) list ranking systems api
- (DONE) create a ranking system api
- (DONE) edit a ranking system api
- (DONE) delete ranking system api
- delete ranking queries when system is deleted
- mongo migrations
- create default system data
- sire and dam inital data
- dead heat rule - points from matching positions are summed and divided

### Ranking API
- List rankings api
- calculate rankings based on a ranking system
- update rankings when race is changed
- update rankings when ranking system (or its sub entities is changed) is changed
- update when greyhound is deleted
- update when race is deleted
- update when rule set is deleted

### Ranking System UI
- add the ranking system page (lists the ranking rules)

### Ranking UI
- list all rankings on the home screen

## 0.2 - Getting to Ranker 6 Level
- Move upload to a directive
- race upload section
- placing upload section
- table pick the page size
- table sort
- table export to csv
- rankings export to special csv
- Sire and racer edit should be a select2 / text input directive
- Add prompts for delete actions
- inline create form on greyhound
- inline edit form on greyhound
- search on keydown for tables search box
- race & placing csv import api

## 0.3 - Beyond the ranker 6
- global search (on a search page)
- Add a find parents button
- on the placing screen have a badge displaying points earned this round and the total points
- have the ability to auto fill a race. When creating a race it should detect what the race is and offer to auto fill.
- list who is in contention for the wild card
- list who is going to win dam of the year
- list who is going to win sire of the year
- had race distance meters be auto completed, driven from track or all races
- add description and icon to group level. It should describe what is that group level and have approiate icon (like a cup or money amount)
- list a race calendar when creating a race
- on race list page list the calendar for the current month (one colour for entered, another for pending, another for guessed)
- graph of how a greyhound has preformed over the year
- graph to compare to greyhounds
- graph of point distrobution over the year, showing percentage left, spent
- warn for missing race at the end of the month
- have the ability to send notifications if races are missed

## Data Feeds
### Calendar
agra.com.au

### Results
grv.com.au
greyhoundnsw.com.au
racingtas
racingqld
agra.com.au

### Breeding
grv.com.au
greyhound-data.com
hotgod.com.au

