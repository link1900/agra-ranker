const setting = module.exports = {};
const mongoose = require('mongoose');
const timestamps = require('mongoose-concrete-timestamps');

const Schema = mongoose.Schema;

setting.definition = {
    settingType: { type: String },
    defaultRankingSystem: { type: String }
};

setting.schema = new Schema(setting.definition);

setting.schema.plugin(timestamps);

if (mongoose.models.Setting) {
    setting.model = mongoose.model('Setting');
} else {
    setting.model = mongoose.model('Setting', setting.schema);
}
