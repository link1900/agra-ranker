var greyhoundIngestService = module.exports = {};

var q = require('q');
var _ = require('lodash');
var Xray = require('x-ray');
var xray = Xray();
var logger = require('winston');
var moment = require('moment-timezone');

greyhoundIngestService.grvUrl = "https://fasttrack.grv.org.au";

greyhoundIngestService.getExternalGreyhoundInfo = function(greyhoundName){
    if (greyhoundName){
        var url = greyhoundIngestService.buildGRVGreyhoundUrl(greyhoundName);
        return greyhoundIngestService.downloadGreyhoundInfo(url);
    } else {
        q.reject("cannot retrieve info on invalid greyhound or greyhound name")
    }
};

greyhoundIngestService.buildGRVGreyhoundUrl = function(name){
    return greyhoundIngestService.grvUrl +"/Dog/Search?Dog=" + encodeURI(name) + "&ExactMatch=true&Search=Search";
};

greyhoundIngestService.postProcessGreyhoundScrap = function(scrapResult){
    logger.info("lookup is post processing found results");
    if (scrapResult && scrapResult.fields && scrapResult.fields.length > 0){
        var fields = scrapResult.fields.map(function(field){
            field.value = field.value.replace(/\n/g, '').trim();
            return field;
        });
        var postProcess = {};

        postProcess.status = _.get(_.find(fields, { 'label': 'Status'}), 'value', null);
        postProcess.color = _.get(_.find(fields, { 'label': 'Colour'}), 'value', null);
        postProcess.gender = _.get(_.find(fields, { 'label': 'Sex'}), 'value', null);
        postProcess.dateOfBirth = _.get(_.find(fields, { 'label': 'Whelped'}), 'value', null);
        postProcess.sireName = _.get(_.find(fields, { 'label': 'Sire'}), 'value', null);
        postProcess.damName = _.get(_.find(fields, { 'label': 'Dam'}), 'value', null);
        if (postProcess.gender){
            postProcess.gender = postProcess.gender.toLowerCase();
        }

        if (postProcess.dateOfBirth){
            postProcess.dateOfBirth = moment.tz(postProcess.dateOfBirth, 'DD/MM/YYYY', 'Australia/Melbourne').toDate();
        }

        postProcess.nameAssignedAt = _.get(_.find(fields, { 'label': 'Name Assigned'}), 'value', null);
        if (postProcess.nameAssignedAt){
            postProcess.nameAssignedAt = moment.tz(postProcess.nameAssignedAt, 'DD/MM/YYYY', 'Australia/Melbourne').toDate();
        }

        var ref = {};
        ref.source = "fasttrack";
        if (scrapResult.url){
            ref.id = scrapResult.url.replace('https://fasttrack.grv.org.au/Dog/Details/', '');
            ref.url = scrapResult.url;
        }
        postProcess.ref = ref;
        return q(postProcess);
    } else {
        return q(scrapResult);
    }
};

greyhoundIngestService.downloadGreyhoundInfo = function(url){
    return greyhoundIngestService.downloadGreyhoundFromSite(url)
        .then(greyhoundIngestService.processMultiples)
        .then(greyhoundIngestService.postProcessGreyhoundScrap);
};

greyhoundIngestService.downloadGreyhoundFromSite = function(url){
    var deferred = q.defer();
    //logger.info("Scrap site [" + url + "]");
    xray(url, {
        url: "a[rel='dog-details']@href",
        searchResults: xray(".search-results", {
            results: xray("tr", [{
                name: "a",
                url: "a@href"
            }])
        }),
        fields: xray('.field', [{
            label: 'label',
            value: ".display-value"
        }])
    })(function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }

    });
    return deferred.promise;
};

greyhoundIngestService.processMultiples = function(scrapResult){
    if (scrapResult.url){
        logger.info("lookup found valid greyhound");
        return q(scrapResult);
    } else if (!scrapResult.url && scrapResult.searchResults && scrapResult.searchResults.results){
        logger.info("lookup found multiple greyhounds", scrapResult.searchResults.results.length);
        return greyhoundIngestService.scrapMultiples(scrapResult.searchResults.results);
    } else {
        logger.info("lookup found nothing", JSON.stringify(scrapResult));
        return q(scrapResult);
    }
};

greyhoundIngestService.getYoungest = function(lookups){
    logger.info("lookup finding youngest valid greyhound from: " + JSON.stringify(lookups));

    if (lookups && lookups.length > 0){
        //first remove retired greyhounds or anything without name assigned date
        lookups = lookups.filter(function(lookup){
            return lookup.status !== "Retired" && lookup.nameAssignedAt != null;
        });

        //sort by nameAssignedAt desending
        lookups.sort(function(a,b) { return new Date(b.nameAssignedAt).getTime() - new Date(a.nameAssignedAt).getTime() } );

        _.last(lookups);
    } else {
        return q(null);
    }

    return q(lookups[0]);
};

greyhoundIngestService.scrapMultiples = function(multipleGreyhounds){
    if (multipleGreyhounds && multipleGreyhounds.length > 0){
        return q.all(multipleGreyhounds.map(function(greyhoundSearch){
            var lookupUrl = greyhoundSearch.url;
            return greyhoundIngestService.downloadGreyhoundInfo(lookupUrl);
        })).then(function(lookupResults){
            return greyhoundIngestService.getYoungest(lookupResults);
        });
    } else {
        logger.info("lookup tried to lookup mulitple greyhounds but failed");
        return q.resolve(null);
    }
};