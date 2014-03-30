var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var RaceSchema = new Schema({
    name: { type: String },
    date: {type: Date},
    groupLevelRef: {type: Schema.Types.ObjectId},
    distanceMeters: {type: Number},
    disqualified: {type: Boolean}
});

RaceSchema.plugin(timestamps);

mongoose.model('Race', RaceSchema);