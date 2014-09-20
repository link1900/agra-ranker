var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var PlacingSchema = require('./placing');

var PointAllotmentSchema = new Schema({
    points : { type: Number },
    placingRef: {type: String},
    placing: {type: PlacingSchema},
    rankingSystemRef: {type: String}
});

PointAllotmentSchema.plugin(timestamps);

mongoose.model('PointAllotment', PointAllotmentSchema);
