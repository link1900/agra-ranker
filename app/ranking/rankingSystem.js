var rankingSystem = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var allotmentCriteriaDefinition = {
    field: {type: String},
    comparator:{type: String},
    value:{type: Schema.Types.Mixed},
    type:{type: String}
};

var pointAllotmentDefinition = {
    criteria: {type: [allotmentCriteriaDefinition], default: []},
    series: {type: String},
    points: {type: Number}
};

rankingSystem.schema = new Schema({
    name: { type: String },
    description: {type: String},
    equalPositionResolution: {type: String, default: 'splitPoints'},
    defaultRanking: {type: Boolean, default: false},
    groupBy : {type: {
        label: {type : String},
        field: {type: String}
    }},
    pointAllotments: {type: [pointAllotmentDefinition], default : []},
    commonCriteria : {type:[allotmentCriteriaDefinition], default: []}
});

rankingSystem.schema.plugin(timestamps);

rankingSystem.model = mongoose.model('RankingSystem', rankingSystem.schema);