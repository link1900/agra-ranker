var rankingSystem = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var allotmentCriteriaSchema = new Schema({
    field: {type: String},
    comparator:{type: String},
    value:{type: Schema.Types.Mixed},
    type:{type: String}
});

var pointAllotmentSchema = new Schema({
    criteria: {type: [allotmentCriteriaSchema]},
    series: {type: String},
    points: {type: Number}
});

rankingSystem.schema = new Schema({
    name: { type: String },
    description: {type: String},
    equalPositionResolution: {type: String, default: 'splitPoints'},
    defaultRanking: {type: Boolean, default: false},
    pointAllotments: {type: [pointAllotmentSchema]}
});

rankingSystem.schema.plugin(timestamps);

rankingSystem.model = mongoose.model('RankingSystem', rankingSystem.schema);