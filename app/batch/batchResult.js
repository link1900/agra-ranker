var batchResult = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


batchResult.schema = new Schema({
    batchRef: { type: Schema.Types.ObjectId },
    status: { type: String },
    startDate: { type: Date },
    endDate: {type: Date},
    recordNumber: {type: Number},
    raw : {type: String},
    stepResults : {type: [String]}
});

//statuses
//Failed - record failed
//Success - record succeed

batchResult.schema.plugin(timestamps);

if (mongoose.models.BatchResult) {
    batchResult.model = mongoose.model('BatchResult');
} else {
    batchResult.model = mongoose.model('BatchResult', batchResult.schema);
}