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
        return greyhoundIngestService.downloadInfo(url)
            .then(greyhoundIngestService.postProcess);
    } else {
        q.reject("cannot retrieve info on invalid greyhound or greyhound name")
    }
};

greyhoundIngestService.buildGRVGreyhoundUrl = function(name){
    return greyhoundIngestService.grvUrl +"/Dog/Search?Dog=" + encodeURI(name) + "&ExactMatch=true&Search=Search";
};

greyhoundIngestService.postProcess = function(scrapResult){
    var fields = scrapResult.fields.map(function(field){
        field.value = field.value.replace(/\s/g, '');
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

    var ref = {};
    ref.source = "fasttrack";
    if (scrapResult.url){
        ref.id = scrapResult.url.replace('/Dog/Details/', '');
        ref.url = 'https://fasttrack.grv.org.au/Dog/Details/' + ref.id;
    }
    postProcess.ref = ref;

    return q(postProcess);
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

greyhoundIngestService.downloadInfo = function(url){
    var deferred = q.defer();
    logger.info("API request [" + url + "]");
    xray(url, {
        url: "a[rel='dog-details']@href",
        fields: xray('.field', [{
            label: 'label',
            value: ".display-value"
        }])
    })(function(err, result) {
        if (err) throw deferred.reject(err);
        deferred.resolve(result);
    });
    return deferred.promise;
};