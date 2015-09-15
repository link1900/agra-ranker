var setting = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

setting.definition = {
    settingType : {type: String},
    defaultRankingSystem : { type: String }
};

setting.schema = new Schema(setting.definition);

setting.schema.plugin(timestamps);

if (mongoose.models.Setting) {
    setting.model = mongoose.model('Setting');
} else {
    setting.model = mongoose.model('Setting', setting.schema);
}