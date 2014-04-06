var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var PointScaleSchema = new Schema({
    name: { type: String }
});

PointScaleSchema.plugin(timestamps);

mongoose.model('PointScale', PointScaleSchema);
