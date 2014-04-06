var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var RankingSystemSchema = new Schema({
    name: { type: String },
    description: {type: String}
});

RankingSystemSchema.plugin(timestamps);

mongoose.model('RankingSystem', RankingSystemSchema);
