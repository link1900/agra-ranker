# Todo
## 6.1 - Basics
### 6.0.1 Greyhound
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

### 6.0.2 Deployment
- (DONE) setup heroku app
- (DONE) setup prod key
- (DONE) deploy to heroku
- (DONE) test that it works online

### 6.0.3 Refactor Cleanups
- (DONE) fix the top menu so that it looks nice in firefox and has highlighting
- (DONE) force https and piggy back on heroku certs
- (DONE) make the login screen work with lastpass and normal auto complete
- (DONE) Move table to a directive
- (DONE) fix sire selector to always get all results or do inactive paging
- (DONE) fix offspring table to be actual table
- (DONE) Clean up the server loader. Remove all front end templating.

### 6.0.4 Group Rank API
- (DONE) add group rank api
- (DONE) create group rank api
- (DONE) update group rank api
- (DONE) delete group rank api
- (DONE) delete cleaned up race references

### 6.0.5 Races API
- (DONE) list races api
- (DONE) create race api (no placings)
- (DONE) view race api
- (DONE) edit race api

### 6.0.6 Placings API
- (DONE) create a placing api
- (DONE) edit a placing api
- (DONE) list placing api (query for by race or greyhound)
- (DONE) delete a placing api
- (DONE) delete placing when greyhound is deleted
- (DONE) delete placing when race is deleted

### 6.0.7 Group Rank UI
- (DONE) list group levels
- (DONE) group rank edit screen
- (DONE) group rank create screen
- (DONE) group rank delete button

### 6.0.8 Race UI
- (DONE) List out all races on the race screen
- (DONE) race edit screen
- (DONE) race create screen
- (DONE) race delete button

###6.0.9 General UI
- (DONE) Headers need to be standardized
- (DONE) Menu needs to be darker
- (DONE) Fix auto login
- (DONE) Section borders need to be a darker color
- (DONE) Section color need to be standardized
- (DONE) race create needs to have group levels listed
- (DONE) race form for distance needs to be the various standard meter lengths and free text
- (DONE) race form no race needs to have a help slide out and needs more padding
- (DONE) move race display placings out of the race container
- (DONE) placing directive needs custom text for no items

### 6.0.10 Placing UI
- (DONE) placing shouldn't allow you to place multiple times in a race
- (DONE) placing shouldn't allow you to have the same placing twice
- (DONE) change placing position as a string
- (DONE) put in place did not finish and disqualification as valid strings
- (DONE) validate the placing position as a certain types of string
- (DONE) races / placings listed on the greyhound view
- (DONE) interactive drag and drop of text fields for placing creation on race screen
- (DONE) make greyhound field a directive
- (DONE) errors are printed out as a list
- (DONE) when adding a greyhound on the placing screen make it auto save the placing
- (DONE) when moving a greyhound on the placing screen make it auto save the placing
- (DONE) fix an issue when saving the positions are being saved in one position down
- (DONE) can add a new placing on an existing race with existing placings
- (DONE) can edit placings - maybe this should be done through add only
- (DONE) can remove placings
- (DONE) a new or existing greyhound on the placing edit
- (DONE) when saving a race on the race edit screen the alerts are also shown for placing edit
- (DONE) fix spacing on the placing add field
- (DONE) can editing placing on race creation (or forward onto the race edit screen)
- (DONE) put delete on the greyhound view
- (DONE) Add a clear button on greyhound search
- (DONE) Error on placing move
- (DONE) type ahead for race search
- (DONE) Greyhound search should be big text and upper cased
- (DONE) Race with the same name and date can be created
- (DONE) Race search is lower casing the name
- (DONE) Replace all greyhound name fields with the directive
- (DONE) Fix the menu selectors
- (DONE) remove point scale
- (DONE) remove query params
- (DONE) remove query api
- (DONE) add the ranking system page (lists the ranking rules)

### 6.0.11 Ranking System
- (DONE) build basic ranking system model (name and desc fields)
- (DONE) build basic ranking system crud controllers and ui
- (DONE) list ranking systems api
- (DONE) create a ranking system api
- (DONE) edit a ranking system api
- (DONE) delete ranking system api
- (DONE) clone ranking system
- (DONE) mongo migrations system
- (DONE) build advanced ranking system crud for query and point sets
- (DONE) point allotment get api
- (DONE) remove point allotment post api
- (DONE) change placing to be fly weight for race and greyhound
- (DONE) recalculate rankings for a ranking system
- (DONE) point allotment display for a ranking system
- (DONE) Add a series field to a point definition
- (DONE) Added versioning display
- (DONE) Change point definition view to group by series
- (DONE) import point definitions from a file (browser import only?)
- (DONE) Fix import link after the upload to be correct
- (DONE) Fix the delete batch to be faster
- (DONE) Rewrite the batch processor to make sure it does block
- (DONE) Add file uploading into the gridfs
- (DONE) Add batch processes which control and details information about current batch jobs
- (DONE) Add a failed batch job checker which checks if a in progress batch job is in a batch processor
- (DONE) Change Import greyhound csv batch job to just create a new batch job Import Greyhound
- (DONE) Fix an issue where batch process clogs the server
- (DONE) Fix an issue where batch processing begins before the file is finished uploading
- (DONE) Fix an issue where when server crashes before batch processing is finished then the batch is ignored
- (DONE) BatchResult - Create new a result for each action a batch does
- (DONE) Batch - add a total processed time field, calculate it and display it
- (DONE) Batch - count the result records to get a total count of success and failure and unprocessed
- (DONE) in the grid when there is no results have no search
- (DONE) Change the batch to wait until it has finished processing a record before it does the next record
- (DONE) Fix an issue where greyhound import is creating multiple same greyhounds
- (DONE) fix an issue with imported greyhounds not having created and updated date
- (DONE) on the count screen list the total stored file size
- (DONE) add the ability to delete all files
- (DONE) list all disk usage on the counts page
- (DONE) have the ability to list files stored and download them
- (DONE) have the ability to download a file from a batch

### 6.0.12 Admin controls and user
- (DONE) List users
- (DONE) Remove users
- (DONE) Add user
- (DONE) Add state to users [inactive, active, requested, invited]
- (DONE) New api to request access to the site
- (DONE) Api to approve access requests
- (DONE) Send email to users that have been approved
- (DONE) Add first and last name to user
- (DONE) add change password(self user only security)
- (DONE) add reset users password
- (DONE) Forgotten password system (emails you a reset link)
- (DONE) Display users name in the user list
- (DONE) Put rate limiting on the public apis
- (DONE) system bootstrapping mode which is active when no users system has no users and uses preloaded code to take admin
- (DONE) auto login on active user sign up
- (DONE) hide passcode if system not in bootstrap
- (DONE) Send an email to invited users (with a link to the accept invite and token checker)
- (DONE) Fix test startup
- (DONE) CRUD for invites
- (DONE) delete invite after it has been used (requires test)
- (DONE) hide the token field (requires test)
- (DONE) add delete all expired button for invites
- (DONE) Send an email when a user request is made (to users that elect to get the email)
- (DONE) On user request send an email to all users which have requested to be notified (passcode user is defaulted to yes)

### 6.0.13 Racing, export and search
- (DONE) Remove white list and have all sign ups require approval
- (DONE) Create default data command for group levels
- (DONE) Add a from now from filter and change dates over to that filter
- (DONE) rename ranking system equal points to dead heat distribution
- (DONE) export greyhound csv
- (DONE) Upgrade the grid to have total count and display of record
- (DONE) Add race importing
- (DONE) order placing listing by placing number by default

### 6.0.14 Ranking Phase 2
- (DONE) investigate speed of ranking calculation without using pointAllotments - can be done but slower then it being stored.
- (DONE) add common criteria to ranking system
- (DONE) fix the button alignment in the ranking system edit
- (DONE) fix the criteria fields and types
- (DONE) add a boolean type to rankingSystem criteria
- (DONE) add validation to criteria
- (DONE) read rankings from database and not calculated on the fly
- (DONE) remove point allotment it is not required for storage
- (DONE) Refactor front end to be via the main groups
- (DONE) Add ranking system criteria field value replacement for calendar start and end dates
- (DONE) Add Agra Ranking System (for calendar year)
- calculate rankings on placing creation
- calculate rankings on placing edit
- calculate rankings on placing delete
- on greyhound delete, remove all placings for that greyhound
- on race delete, remove all placings for that race
- validate that placings must have a race and greyhound reference
- test that rankings are update on placing creation
- test that rankings are update on placing update
- add event stream ui
- add event for greyhound crud and imports
- add event for race curd and imports
- split the testing and move them into the app break up test helper
- refactor the admin service to import the models once and do all operations of that list
- refactor the hardcoded template creation to the specific area
- allow logged in users to save there ui settigs
- allow admin to configure the global ui settings
- update ranking display to show placings (lazyload?)
- update ranking display to show cards
- update the read me with the .example_env and what each config does
- add protactor tests for the major flows like greyhound crud, race crud placing crud, rankings and score check
- (DONE) create default data command for ranking system
- define agra ranking system and test importing it
- define sire and dam ranking systems test import it
- dead heat rule - points from matching positions are summed and divided
- auto retieve sire and dam for a greyhound from authority site (with confirm prompt)
- (DONE) List rankings api
- (DONE) calculate rankings based on a ranking system
- update rankings when race is changed
- update rankings when ranking system (or its sub entities is changed) is changed
- update when greyhound is deleted
- update when race is deleted
- update when rule set is deleted
- delete rankings when ranking system is deleted

### 6.0.15 Advanced search
- Upgrade grid to have good search controls for races
- Hide extra search options if none are defined
- Save the advanced search options on a grid (in the panel is open or closed and the details)
- Advanced search options have a clear button which clears all settings
- Switch basic like search to use mongo full text search
- allow race search to be done by two dates

## 6.1.0 - Getting to Ranker 6 Level
- (DONE) list all rankings on the home screen
- put in proper action logging
- save the history log to the database
- change npm test to constant
- Move upload to a directive
- have the ability confirm a races data / deal with conflicts and merge it
- export races csv
- race upload section
- placing upload section
- table pick the page size
- table sort
- table export to csv
- rankings export to special csv
- Sire and dam edit should be a select2 with new option
- Placing new greyhound should be a select 2 with new option
- Add prompts for delete actions
- inline create form on greyhound
- inline edit form on greyhound
- search on keydown for tables search box
- race & placing csv import api
- Switch test data loading to fixtures
- deploy and perform PVT online

## 6.1.1 - Beyond the ranker 6 first steps

## Backlog - Beyond the ranker 6
- export greyhound json
- export races json
- add a news section
- siblings feature which display both full and half siblings
- Fix set model in the routes to be json based, done after auth and standardized
- Fix an issue when calling DELETE /user/badid
- Investigate what happens with an un matched route
- auto redirect
- add material design https://material.angularjs.org
- add unsubscribe link to email footers (alert emails only)
- Add gravatar link to new window for avatar
- Default avatar to be svg initals or first two letter of email
- Add a system event register
- Add activity stream admin page
- Add roles [user, admin] (user allows editing, admin allows access to admin api)
- add scheduling to batch system
- Add created by which is a flyweight to user?
- new batch job to automatic backup database to s3
- Add user setting timezone and make sure timezones works
- on the placing screen have the numbers come from a set list of placings (1st -> 1, 2nd -> 2, DNF -> DNF, Dis -> dis, etc.)
- global search (on a search page)
- Add a find parents button
- fixture data is required
- batch job to clean up expired invites or (mongo TTL index)
- Send emails when password is changed
- On the view point definitions have common criteria sit under the series header on for each definition
- on the placing screen have a badge displaying points earned this round and the total points
- have the ability to auto fill a race. When creating a race it should detect what the race is and offer to auto fill.
- list who is in contention for the wild card
- list who is going to win dam of the year
- list who is going to win sire of the year
- have a history log of all actions taken in the system for auditing reason
- add series function which can create many point definitions at once
- When adding a point definitions series allow range usage [1..10]
- had race distance meters be auto completed, driven from track or all races
- add description and icon to group level. It should describe what is that group level and have approiate icon (like a cup or money amount)
- list a race calendar when creating a race
- on race list page list the calendar for the current month (one colour for entered, another for pending, another for guessed)
- graph of how a greyhound has preformed over the year
- graph to compare to greyhounds
- graph of point distrobution over the year, showing percentage left, spent
- warn for missing race at the end of the month
- have the ability to send notifications if races are missed

- Batch - add the ability to cancel/suspend a batch mid process
- Batch - display percentage when in progress
- Batch Controller - Add the ability to get the batch controller to suspend/dump what it is doing
- Add a web socket which display the batch processor information
- Add processed percentage to the processor information
- Fix an issue where the paging on the batch doesn't seem to work for high numbers of records
- restructure files into functional groups not hoz slices
- Add totals to the admin data screen

- move mongoHelper back into helper
- cleanup helper to be consistent

- update batching code to be streaming
- add image support for uploading a greyhounds image to its profile
- add track entity
- add image support for track
- add description field group level
- add description field to race
- add race type which is for annual repeating races
- show the ranking position for the previous month
- show the rankings in chart form

- lock form and hide controls when saving
- should have spinny button when doing ajax call
- pretty up the view forms to not be so cluttered
- textured background

## Data Feeds

### lib
node.io

### Calendar
agra.com.au

### Results
grv.com.au
thedogs.com.au
greyhoundnsw.com.au
grv.com.au
racingtas
racingqld
agra.com.au

### Breeding
grv.com.au
greyhound-data.com
hotgod.com.au