var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

var GroupLevelDesc = {
    name: {type: String}
};

var GroupLevelSchema = new Schema(GroupLevelDesc);

GroupLevelSchema.plugin(timestamps);

mongoose.model('GroupLevel', GroupLevelSchema);

module.exports = GroupLevelDesc;