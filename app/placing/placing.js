var placing = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var RaceSchema = require('../race/race').definition;
var GreyhoundDefinition = require('../greyhound/greyhound').definition;

placing.definition = {
    placing: { type: String },
    raceRef: {type: String},
    race : {type: RaceSchema},
    greyhoundRef: {type: String},
    greyhound : {type: GreyhoundDefinition},
    prizeMoney : {type: Number},
    time: {type: Number},
    margin: {type: String }
};

placing.schema = new Schema(placing.definition);

placing.schema.plugin(timestamps);

if (mongoose.models.Placing) {
    placing.model = mongoose.model('Placing');
} else {
    placing.model = mongoose.model('Placing', placing.schema);
}