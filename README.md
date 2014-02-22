## Agra Ranking Server

Web server used to rank greyhounds.

## Usage

Clone this repository

    $ npm install
    $ npm start

## Todo

### Greyhound
-(DONE) interactive validation of name
-(DONE) have a view form for a greyhound
-(DONE) clicking table loads greyhound details into view form
-(DONE) have an edit mode
-(DONE) delete an existing greyhound
-(DONE) edit an existing greyhound
- sire & dam fields (navigiation, edit, smart creation)
- have the look up of the name to say if it is new or not (off focus for the parent fields)
- table pagination
- search greyhound table
- greyhound data auto importer (progress bars, streaming backend)
- setup prod key
- setup login
- setup action security around editing greyhounds and creating greyhounds

### Deployment
- setup heroku app
- deploy to heroku
- test that it loads

### Races
- list races
- update when greyhound is deleted
- update greyhound when race is deleted

### Rankings
- design rules and ranking storage
- list ranking
- update when greyhound is deleted
- update when race is deleted