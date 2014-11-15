var ranking = module.exports = {};

var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

ranking.definition = {
    rankingSystemRef : { type: String },
    greyhoundRef: { type: String },
    greyhoundName: { type: String },
    totalPoints : { type: Number }
};

ranking.schema = new Schema(ranking.definition);

ranking.schema.plugin(timestamps);

ranking.model = mongoose.model('Ranking', ranking.schema);
