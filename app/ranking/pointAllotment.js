var pointAllotment = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;
var PlacingDefinition = require('../placing/placing').definition;

pointAllotment.definition = {
    points : { type: Number },
    placingRef: {type: String},
    placing: {type: PlacingDefinition},
    rankingSystemRef: {type: String}
};

pointAllotment.schema = new Schema(pointAllotment.definition);

pointAllotment.schema.plugin(timestamps);

pointAllotment.model = mongoose.model('PointAllotment', pointAllotment.schema);
