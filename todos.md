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
- (DONE) calculate rankings on placing creation
- (DONE) calculate rankings on placing edit
- (DONE) calculate rankings on placing delete
- (DONE) on greyhound delete, remove all placings for that greyhound
- (DONE) on race delete, remove all placings for that race
- (DONE) validate that placings must have a race and greyhound reference
- (DONE) test that create greyhound issues event
- (DONE) test that update greyhound issues event
- (DONE) test that delete greyhound issues event
- (DONE) test that batch greyhound  issues event
- (DONE) test that create race issues event
- (DONE) test that update race issues event
- (DONE) test that delete race issues event
- (DONE) test that batch race issues event
- (DONE) test that create group level issues event
- (DONE) test that update group level issues event
- (DONE) test that delete group level issues event
- (DONE) test that race listens to group level changes
- (DONE) test that rankings listens to placing changes
- (DONE) add event stream ui
- (DONE) create default data command for ranking system
- (DONE) List rankings api
- (DONE) calculate rankings based on a ranking system
- (DONE) update sb table to be based on watch changes to the parameters
- (DONE) update sb table to allow for page limit changes
- (DONE) update sb table to allow for ctrl to customise search options (advanced search)
- (DONE) sb table - Fixed the no records text to make clear why there are no records also enlarge text
- (DONE) sb table - Add text search back to greyhound and race
- (DONE) sb table - Remove references to hide search
- (DONE) fix greyhound placings
- (DONE) fix greyhound offspring
- (DONE) fix race placings
- (DONE) update sb table to allow for custom column expands
- (DONE) have rankings paging work
- (DONE) fix an issue where page is not saved in search save
- (DONE) allow user to reset searches settings (delete storage keys and set to defaults)
- (DONE) change greyhound view to make clear the offspring and places
- (DONE) change the race view to make clear the placing (BUG: paging and totals)
- (DONE) change how ranking queries work so that they are calculated based on parameters of a period
- (DONE) Fix greyhound casing
- (DONE) allow users to select which ranking system they wish to view
- (DONE) allow users to select which ranking system type they wish to view
- (DONE) update ranking display to show placing points on a card(lazyload?)
- (DONE) update ranking system to use mongo to do the aggregation
- (DONE) update ranking system to store result to the ranking collection and read from there
- (DONE) define agra ranking system
- (DONE) define sire and dam ranking systems

## 6.1.0 - Getting to Ranker 6 Level
- (DONE) list all rankings on the home screen
- (DONE) Export rankings as csv
- (DONE) Export greyhounds as csv
- (DONE) Export greyhounds as JSON
- (DONE) Export Races as CSV
- (DONE) Export rankings in overlapping grid format csv
- (DONE) Contributing races should link to the race
- (DONE) Expose the ability to make a ranking a default ranking for the system
- (DONE) List greyhounds
    - (DONE) Filter by month
    - (DONE) Filter by year
    - (DONE) Filter by financial year
    - (DONE) Filter between dates
    
- (DONE) When adding a greyhound to a race have the ability for it to be a new greyhound
- (DONE) When setting a sire of a greyhound it should be a modal or link back to the sire and same for dam
- (DONE) Greyhound placings should display group and race length (and default points)
- (DONE) Ranking placing display needs some padding
- (DONE) table sort
- (DONE) investigate an issue with the race dates
- (DONE) deploy and perform PVT online
- (DONE) fix template typos
- (DONE) bug with direct user creation
- (DONE) bug with the date formats not be parsed correctly
- (DONE) bug with a greyhound being missing
- (DONE)bug with the rankings not being displayed


## rewrite ranking engine v3 ##
- add placings to greyhounds
- remove all routes for placings
- create a simple ranking module
- remove ranker modual
