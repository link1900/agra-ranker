var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var RaceDesc = {
    name: { type: String },
    date: {type: Date},
    groupLevelRef: {type: Schema.Types.ObjectId},
    distanceMeters: {type: Number},
    disqualified: {type: Boolean}
};

var RaceSchema = new Schema(RaceDesc);

RaceSchema.plugin(timestamps);

mongoose.model('Race', RaceSchema);
module.exports = RaceDesc;