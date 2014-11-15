var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var PlacingDefinition = require('../placing/placing').definition;

var PointAllotmentSchema = new Schema({
    points : { type: Number },
    placingRef: {type: String},
    placing: {type: PlacingDefinition},
    rankingSystemRef: {type: String}
});

PointAllotmentSchema.plugin(timestamps);

mongoose.model('PointAllotment', PointAllotmentSchema);
