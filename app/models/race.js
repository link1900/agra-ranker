var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var GroupLevelSchema = require('../groupLevel/groupLevel').definition;

var RaceDesc = {
    name: { type: String },
    date: {type: Date},
    groupLevelRef: {type: Schema.Types.ObjectId},
    groupLevel: {type: GroupLevelSchema},
    distanceMeters: {type: Number},
    disqualified: {type: Boolean, default: false}
};

var RaceSchema = new Schema(RaceDesc);

RaceSchema.plugin(timestamps);

mongoose.model('Race', RaceSchema);
module.exports = RaceDesc;