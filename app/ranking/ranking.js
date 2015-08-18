var ranking = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

ranking.scoreSchema = {
    points: {type: Number},
    placingRef: {type: String},
    position: {type: String},
    raceName: {type: String},
    raceRef: {type: String}
};

ranking.definition = {
    fingerPrint : {type: String},
    rank: {type: Number},
    rankingSystemRef : { type: String },
    greyhoundRef: { type: String },
    greyhoundName: { type: String },
    totalPoints : { type: Number },
    scores : {type: [ranking.scoreSchema]}
};

ranking.schema = new Schema(ranking.definition);

ranking.schema.plugin(timestamps);

ranking.model = mongoose.model('Ranking', ranking.schema);
