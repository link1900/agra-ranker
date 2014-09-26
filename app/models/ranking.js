var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var RankingSchema = new Schema({
    rankingSystemRef : { type: String },
    greyhoundRef: { type: String },
    greyhoundName: { type: String },
    totalPoints : { type: Number }
});

RankingSchema.plugin(timestamps);

mongoose.model('Ranking', RankingSchema);
