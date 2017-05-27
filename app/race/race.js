const race = module.exports = {};
const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');

const Schema = mongoose.Schema;

race.definition = {
    name: { type: String },
    date: { type: Date },
    groupLevelName: { type: String },
    distanceMeters: { type: Number },
    disqualified: { type: Boolean, default: false },
    track: { type: String },
    club: { type: String }
};

race.schema = new Schema(race.definition);

race.schema.plugin(timestamps);

if (mongoose.models.Race) {
    race.model = mongoose.model('Race');
} else {
    race.model = mongoose.model('Race', race.schema);
}
