var fastTrackMeetingModel = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;

fastTrackMeetingModel.definition = {
    trackId: {type: String},
    timeslot: {type: String},
    date: {type: Date}
};

fastTrackMeetingModel.schema = new Schema(fastTrackMeetingModel.definition);
fastTrackMeetingModel.schema.plugin(timestamps);

if (mongoose.models.FastTrackMeetingModel) {
    fastTrackMeetingModel.model = mongoose.model('FastTrackMeetingModel');
} else {
    fastTrackMeetingModel.model = mongoose.model('FastTrackMeetingModel', fastTrackMeetingModel.schema);
}