var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var RaceSchema = require('./race');
var GreyhoundSchema = require('./greyhound');

var PlacingDesc = {
    placing: { type: String },
    raceRef: {type: String},
    race : {type: RaceSchema},
    greyhoundRef: {type: String},
    greyhound : {type: GreyhoundSchema}
};

var PlacingSchema = new Schema(PlacingDesc);

PlacingSchema.plugin(timestamps);

mongoose.model('Placing', PlacingSchema);
module.exports = PlacingDesc;