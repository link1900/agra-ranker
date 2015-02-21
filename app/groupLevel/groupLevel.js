var groupLevel = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

groupLevel.definition = {
    name: {type: String}
};

groupLevel.schema = new Schema(groupLevel.definition);

groupLevel.schema.plugin(timestamps);

if (mongoose.models.GroupLevel) {
    groupLevel.model = mongoose.model('GroupLevel');
} else {
    groupLevel.model = mongoose.model('GroupLevel', groupLevel.schema);
}