var batchJob = module.exports = {};
var mongoose = require('mongoose');
var timestamps = require('mongoose-concrete-timestamps');
var Schema = mongoose.Schema;


batchJob.schema = new Schema({
    name: { type: String },
    type: { type: String },
    status: { type: String},
    metadata : { type: Schema.Types.Mixed }
});

//Awaiting processing
//Failed - job completely failed
//Cancelled - stopped before started
//In progress - is currently in progress
//Completed - means the job completed with 100% success
//Completed with failures - means the job completed but records failed

batchJob.schema.plugin(timestamps);

batchJob.model = mongoose.model('BatchJob', batchJob.schema);