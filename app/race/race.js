var race = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var GroupLevelSchema = require('../groupLevel/groupLevel').definition;

race.definition = {
    name: { type: String },
    date: {type: Date},
    groupLevelRef: {type: Schema.Types.ObjectId},
    groupLevel: {type: GroupLevelSchema},
    distanceMeters: {type: Number},
    disqualified: {type: Boolean, default: false}
};

race.schema = new Schema(race.definition);

race.schema.plugin(timestamps);

if (mongoose.models.Race) {
    race.model = mongoose.model('Race');
} else {
    race.model = mongoose.model('Race', race.schema);
}