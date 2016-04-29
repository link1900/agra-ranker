var Xray = require('x-ray');
var xray = Xray();
var fs = require('fs');
var q = require('q');
var _ = require('lodash');
var moment = require('moment-timezone');

function ap(scrapResult){
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
}



fs.readFile('./scripts/testpage.html', {encoding: 'utf8'}, function(err, data) {
    if (err) throw err;
    xray(data, {
        url: "a[rel='dog-details']@href",
        fields: xray('.field', [{
            label: 'label',
            value: ".display-value"
        }])
    })(function(err, result) {
        if (err) throw err;
        ap(result).then(function(out){
            console.log(out);
        })
    });
});

