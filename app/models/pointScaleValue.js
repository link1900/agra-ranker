var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var PointScaleValueSchema = new Schema({
    pointScaleRef: {type: Schema.Types.ObjectId},
    placing: { type: Number },
    points: { type: Number }
});

PointScaleValueSchema.plugin(timestamps);

mongoose.model('PointScaleValue', PointScaleValueSchema);
