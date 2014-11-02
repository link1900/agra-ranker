var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var RaceSchema = require('../race/race').definition;
var GreyhoundDefinition = require('../greyhound/greyhound').definition;

var PlacingDesc = {
    placing: { type: String },
    raceRef: {type: String},
    race : {type: RaceSchema},
    greyhoundRef: {type: String},
    greyhound : {type: GreyhoundDefinition}
};

var PlacingSchema = new Schema(PlacingDesc);

PlacingSchema.plugin(timestamps);

mongoose.model('Placing', PlacingSchema);
module.exports = PlacingDesc;