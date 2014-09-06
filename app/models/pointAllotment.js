var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var PointAllotmentSchema = new Schema({
    points : { type: Number },
    greyhoundRef: {type: Schema.Types.ObjectId},
    placingRef: {type: Schema.Types.ObjectId},
    rankingSystemRef: {type: Schema.Types.ObjectId}
});

PointAllotmentSchema.plugin(timestamps);

mongoose.model('PointAllotment', PointAllotmentSchema);
