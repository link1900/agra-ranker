var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var GroupLevelSchema = new Schema({
    name: {type: String}
});

GroupLevelSchema.plugin(timestamps);

mongoose.model('GroupLevel', GroupLevelSchema);