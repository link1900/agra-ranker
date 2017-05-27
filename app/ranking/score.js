const scores = module.exports = {};

const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');
const Schema = mongoose.Schema;

scores.definition = {
    fingerPrint: { type: String },
    rankingSystemRef: { type: String },
    ref: { type: String },
    name: { type: String },
    points: { type: Number },
    placingRef: { type: String },
    position: { type: String },
    raceName: { type: String },
    raceRef: { type: String }
};

scores.schema = new Schema(scores.definition);

scores.schema.plugin(timestamps);

scores.model = mongoose.model('Score', scores.schema);
