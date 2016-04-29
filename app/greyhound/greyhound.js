var greyhound = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

greyhound.refDefinition = {
    id: {type: String},
    source: {type: String},
    url : {type: String}
};

greyhound.definition = {
    name: {type: String},
    sireRef: {type: String},
    sireName: {type: String},
    damRef: {type: String},
    damName: {type: String},
    dateOfBirth: {type: Date},
    color: {type: String},
    gender: {type: String},
    externalReference : {type: greyhound.refDefinition}
};

greyhound.schema = new Schema(greyhound.definition);

greyhound.schema.plugin(timestamps);

if (mongoose.models.Greyhound) {
    greyhound.model = mongoose.model('Greyhound');
} else {
    greyhound.model = mongoose.model('Greyhound', greyhound.schema);
}