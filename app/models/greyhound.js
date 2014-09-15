var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var GreyhoundDesc = {
    name: { type: String },
    sireRef: { type: Schema.Types.ObjectId },
    damRef: { type: Schema.Types.ObjectId }
};

var GreyhoundSchema = new Schema(GreyhoundDesc);

GreyhoundSchema.plugin(timestamps);

mongoose.model('Greyhound', GreyhoundSchema);
module.exports = GreyhoundDesc;