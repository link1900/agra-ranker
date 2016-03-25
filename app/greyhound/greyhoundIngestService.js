var greyhoundIngestService = module.exports = {};

var q = require('q');
var Xray = require('x-ray');
var xray = Xray();
var logger = require('winston');

greyhoundIngestService.grvUrl = "https://fasttrack.grv.org.au";

greyhoundIngestService.getExternalGreyhoundInfo = function(greyhound){
    if (greyhound && greyhound.name){
        var url = greyhoundIngestService.buildGRVGreyhoundUrl(greyhound.name);
        var selector = {
            url: "a[rel='dog-details']@href",
            sireName: "a[rel='View-Sire']",
            damName: "a[rel='View-Dam']"
        };
        return greyhoundIngestService.downloadInfo(url, selector).then(greyhoundIngestService.addRef);
    } else {
        q.reject("cannot retrieve info on invalid greyhound or greyhound name")
    }
};

greyhoundIngestService.buildGRVGreyhoundUrl = function(name){
    return greyhoundIngestService.grvUrl +"/Dog/Search?Dog=" + encodeURI(name) + "&ExactMatch=true&Search=Search";
};

greyhoundIngestService.addRef = function(result){
    var ref = {};
    ref.source = "fasttrack";
    if (result.url){
        ref.url = result.url;
        ref.id = result.id.replace('https://fasttrack.grv.org.au/Dog/Details/','');
    }
    result.ref = ref;
    return q(result);
};

greyhoundIngestService.downloadInfo = function(url, selector){
    var deferred = q.defer();
    logger.info("API request [" + url + "]");
    xray(url, selector)(function(err, result) {
        if(err){
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};