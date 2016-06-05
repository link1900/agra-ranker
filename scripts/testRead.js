var fs = require('fs');

var greyhoundIngestService = require('../app/greyhound/greyhoundIngestService');


//fs.readFile('./scripts/testDuplicate.html', {encoding: 'utf8'}, function(err, data) {
//    if (err) throw err;
//    return greyhoundIngestService.downloadGreyhoundInfo(data).then(function(result){
//        console.log("results",JSON.stringify(result));
//    }, function(error){
//        console.error(error);
//        throw error;
//    })
//});


greyhoundIngestService.getExternalGreyhoundInfo("DEMON BALE").then(console.log, console.log);