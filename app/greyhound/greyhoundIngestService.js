var greyhoundIngestService = module.exports = {};

var q = require('q');
var Xray = require('x-ray');
var xray = Xray();

greyhoundIngestService.grvUrl = "https://fasttrack.grv.org.au";

greyhoundIngestService.getExternalGreyhoundInfo = function(greyhound){
    if (greyhound && greyhound.name){
        var url = greyhoundIngestService.buildGRVGreyhoundUrl(greyhound.name);
        var selector = {
            id: "a[rel='dog-details']@href",
            sireName: "a[rel='View-Sire']",
            damName: "a[rel='View-Dam']"
        };
        return greyhoundIngestService.downloadInfo(url, selector).then(greyhoundIngestService.grvPostProcess);
    } else {
        q.reject("cannot retieve info on invalid greyhound or greyhound name")
    }
};

greyhoundIngestService.buildGRVGreyhoundUrl = function(name){
    return greyhoundIngestService.grvUrl +"/Dog/Search?Dog=" + encodeURI(name) + "&ExactMatch=true&Search=Search";
};

greyhoundIngestService.grvPostProcess = function(result){
    result.source = "fasttrack";
    if (result.id){
        result.url = result.id;
        result.id = result.id.replace('https://fasttrack.grv.org.au/Dog/Details/-','');
    }

    return q(result);
};

greyhoundIngestService.downloadInfo = function(url, selector){
    var deferred = q.defer();
    xray(url, selector)(function(err, result) {
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};