const rankingSystem = module.exports = {};

const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');

const Schema = mongoose.Schema;

const allotmentCriteriaDefinition = {
    field: { type: String },
    comparator: { type: String },
    value: { type: Schema.Types.Mixed },
    type: { type: String }
};

const pointAllotmentDefinition = {
    criteria: { type: [allotmentCriteriaDefinition], default: [] },
    series: { type: String },
    points: { type: Number }
};

rankingSystem.schema = new Schema({
    name: { type: String },
    description: { type: String },
    equalPositionResolution: { type: String, default: 'splitPoints' },
    groupBy: { type: {
        label: { type: String },
        field: { type: String }
    } },
    pointAllotments: { type: [pointAllotmentDefinition], default: [] },
    commonCriteria: { type: [allotmentCriteriaDefinition], default: [] }
});

rankingSystem.schema.plugin(timestamps);

rankingSystem.model = mongoose.model('RankingSystem', rankingSystem.schema);
