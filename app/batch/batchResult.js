var batchResult = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


batchResult.schema = new Schema({
    batchRef: { type: Schema.Types.ObjectId },
    status: { type: String },
    startDate: { type: Date },
    endDate: {type: Date},
    recordNumber: {type: Number },
    metadata: { type: Schema.Types.Mixed }
});

//statuses
//Failed - record failed
//Success - record succeed

batchResult.schema.plugin(timestamps);

batchResult.model = mongoose.model('BatchResult', batchResult.schema);