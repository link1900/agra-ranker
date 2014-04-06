var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var QuerySchema = new Schema({
    rankingSystemRef: {type: Schema.Types.ObjectId},
    pointScaleRef: {type: Schema.Types.ObjectId}
});

QuerySchema.plugin(timestamps);

mongoose.model('Query', QuerySchema);
