const placing = module.exports = {};

const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');
const RaceSchema = require('../race/race').definition;
const GreyhoundDefinition = require('../greyhound/greyhound').definition;

const Schema = mongoose.Schema;

const placingScore = {
    type: { type: String },
    value: { type: Number }
};

placing.definition = {
    placing: { type: String },
    raceRef: { type: String },
    race: { type: RaceSchema },
    greyhoundRef: { type: String },
    greyhound: { type: GreyhoundDefinition },
    prizeMoney: { type: Number },
    time: { type: Number },
    margin: { type: String },
    scores: { type: [placingScore], default: [] }
};

placing.schema = new Schema(placing.definition);

placing.schema.plugin(timestamps);

if (mongoose.models.Placing) {
    placing.model = mongoose.model('Placing');
} else {
    placing.model = mongoose.model('Placing', placing.schema);
}
