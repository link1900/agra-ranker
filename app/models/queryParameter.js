var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var QueryParameterSchema = new Schema({
    queryRef: {type: Schema.Types.ObjectId},
    field: {type: String},
    comparator:{type: String},
    value:{type: Schema.Types.Mixed}
});

QueryParameterSchema.plugin(timestamps);

mongoose.model('QueryParameter', QueryParameterSchema);