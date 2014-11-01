var greyhound = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

greyhound.definition = {
    name: { type: String },
    sireRef: { type: Schema.Types.ObjectId },
    damRef: { type: Schema.Types.ObjectId }
};

greyhound.schema = new Schema(greyhound.definition);

greyhound.schema.plugin(timestamps);

greyhound.model = mongoose.model('Greyhound', greyhound.schema);
